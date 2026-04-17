import { db } from "@/lib/db";
import { calculateBusinessDays } from "@/lib/utils";
import { calculateLeaveEntitlement, getEmployee } from "./employee.service";
import type { LeaveStatus, LeaveType } from "@/types";

export async function getLeaveBalance(employeeId: string) {
  const employee = await getEmployee(employeeId);
  if (!employee) throw new Error("Employee not found");

  const entitlement = calculateLeaveEntitlement(
    (Date.now() - employee.startDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
  );

  const currentYear = new Date().getFullYear();
  const usedLeave = await db.leaveRequest.groupBy({
    by: ["type"],
    where: {
      employeeId,
      status: "APPROVED",
      startDate: { gte: new Date(`${currentYear}-01-01`) },
      endDate: { lte: new Date(`${currentYear}-12-31`) },
    },
    _sum: { days: true },
  });

  const used: Record<string, number> = {};
  for (const u of usedLeave) {
    used[u.type] = u._sum.days ?? 0;
  }

  return {
    vacation: {
      entitlement: entitlement.vacation,
      used: used["VACATION"] ?? 0,
      remaining: entitlement.vacation - (used["VACATION"] ?? 0),
    },
    sick: {
      entitlement: entitlement.sick,
      used: used["SICK"] ?? 0,
      remaining: entitlement.sick - (used["SICK"] ?? 0),
    },
    personal: {
      entitlement: entitlement.personal,
      used: used["PERSONAL"] ?? 0,
      remaining: entitlement.personal - (used["PERSONAL"] ?? 0),
    },
  };
}

export async function createLeaveRequest(data: {
  employeeId: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason?: string;
}) {
  const { employeeId, type, startDate, endDate, reason } = data;

  // Check for overlapping requests
  const overlap = await db.leaveRequest.findFirst({
    where: {
      employeeId,
      status: { in: ["PENDING", "APPROVED"] },
      OR: [
        { startDate: { lte: endDate }, endDate: { gte: startDate } },
      ],
    },
  });

  if (overlap) {
    throw new Error("Leave request overlaps with an existing request");
  }

  const days = calculateBusinessDays(startDate, endDate);

  return db.leaveRequest.create({
    data: { employeeId, type, startDate, endDate, days, reason, status: "PENDING" },
  });
}

export async function listLeaveRequests(opts: {
  employeeId?: string;
  managerId?: string;
  status?: LeaveStatus;
  year?: number;
  page?: number;
  pageSize?: number;
}) {
  const { employeeId, managerId, status, year, page = 1, pageSize = 20 } = opts;

  const where: Record<string, unknown> = {};
  if (employeeId) where.employeeId = employeeId;
  if (status) where.status = status;
  if (year) {
    where.startDate = { gte: new Date(`${year}-01-01`) };
    where.endDate = { lte: new Date(`${year}-12-31`) };
  }
  if (managerId) {
    where.employee = { managerId };
  }

  const [requests, total] = await Promise.all([
    db.leaveRequest.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, department: true } },
      },
    }),
    db.leaveRequest.count({ where }),
  ]);

  return { requests, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function approveLeaveRequest(
  requestId: string,
  approverId: string
) {
  return db.leaveRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED", approvedBy: approverId, approvedAt: new Date() },
  });
}

export async function rejectLeaveRequest(
  requestId: string,
  rejectionNote: string
) {
  return db.leaveRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED", rejectionNote },
  });
}

export async function cancelLeaveRequest(requestId: string, employeeId: string) {
  const request = await db.leaveRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new Error("Request not found");
  if (request.employeeId !== employeeId) throw new Error("Forbidden");
  if (request.status !== "PENDING") throw new Error("Can only cancel pending requests");

  return db.leaveRequest.update({
    where: { id: requestId },
    data: { status: "CANCELLED" },
  });
}
