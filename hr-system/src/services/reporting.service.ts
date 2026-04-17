import { db } from "@/lib/db";
import type { DashboardStats } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  const [
    totalEmployees,
    activeLeaveRequests,
    pendingReviews,
    openPositionsData,
    newHires,
    leavedEmployees,
  ] = await Promise.all([
    db.employee.count({ where: { isActive: true } }),
    db.leaveRequest.count({ where: { status: "PENDING" } }),
    db.performanceReview.count({ where: { status: { in: ["SUBMITTED", "IN_REVIEW"] } } }),
    db.candidate.findMany({
      where: { stage: { notIn: ["HIRED", "REJECTED"] } },
      select: { position: true },
      distinct: ["position"],
    }),
    db.employee.count({
      where: { startDate: { gte: firstOfMonth }, isActive: true },
    }),
    db.employee.count({
      where: { isActive: false, updatedAt: { gte: oneYearAgo } },
    }),
  ]);

  const turnoverRate = totalEmployees > 0 ? (leavedEmployees / totalEmployees) * 100 : 0;

  return {
    totalEmployees,
    activeLeaveRequests,
    pendingReviews,
    openPositions: openPositionsData.length,
    newHiresThisMonth: newHires,
    turnoverRate: Math.round(turnoverRate * 10) / 10,
  };
}

export async function getHeadcountByDepartment() {
  return db.employee.groupBy({
    by: ["department"],
    where: { isActive: true },
    _count: { department: true },
    orderBy: { _count: { department: "desc" } },
  });
}

export async function getLeaveReport(year: number) {
  const leaveByType = await db.leaveRequest.groupBy({
    by: ["type"],
    where: {
      status: "APPROVED",
      startDate: { gte: new Date(`${year}-01-01`) },
      endDate: { lte: new Date(`${year}-12-31`) },
    },
    _sum: { days: true },
    _count: { type: true },
  });

  const monthlyTrend = await db.leaveRequest.findMany({
    where: {
      status: "APPROVED",
      startDate: { gte: new Date(`${year}-01-01`) },
      endDate: { lte: new Date(`${year}-12-31`) },
    },
    select: { startDate: true, days: true, type: true },
  });

  return { leaveByType, monthlyTrend, year };
}

export async function getRecruitingMetrics() {
  const [totalCandidates, hired, rejected, byStage] = await Promise.all([
    db.candidate.count(),
    db.candidate.count({ where: { stage: "HIRED" } }),
    db.candidate.count({ where: { stage: "REJECTED" } }),
    db.candidate.groupBy({
      by: ["stage"],
      _count: { stage: true },
    }),
  ]);

  const conversionRate = totalCandidates > 0 ? (hired / totalCandidates) * 100 : 0;

  return {
    totalCandidates,
    hired,
    rejected,
    conversionRate: Math.round(conversionRate * 10) / 10,
    byStage: Object.fromEntries(byStage.map((s) => [s.stage, s._count.stage])),
  };
}

export async function exportEmployeesCSV() {
  const employees = await db.employee.findMany({
    where: { isActive: true },
    orderBy: [{ department: "asc" }, { lastName: "asc" }],
    include: {
      manager: { select: { firstName: true, lastName: true } },
    },
  });

  const headers = [
    "ID",
    "First Name",
    "Last Name",
    "Email",
    "Department",
    "Job Title",
    "Role",
    "Manager",
    "Start Date",
    "Phone",
  ];

  const rows = employees.map((e) => [
    e.id,
    e.firstName,
    e.lastName,
    e.email,
    e.department,
    e.jobTitle,
    e.role,
    e.manager ? `${e.manager.firstName} ${e.manager.lastName}` : "",
    e.startDate.toISOString().split("T")[0],
    e.phone ?? "",
  ]);

  return [headers, ...rows].map((r) => r.join(",")).join("\n");
}
