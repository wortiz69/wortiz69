import { db } from "@/lib/db";
import { getTenureYears } from "@/lib/utils";
import type { Employee } from "@/types";

export async function getEmployee(id: string) {
  return db.employee.findUnique({
    where: { id },
    include: {
      manager: {
        select: { id: true, firstName: true, lastName: true, jobTitle: true },
      },
    },
  });
}

export async function getEmployeeByEmail(email: string) {
  return db.employee.findUnique({ where: { email } });
}

export async function listEmployees(opts: {
  department?: string;
  role?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  isActive?: boolean;
}) {
  const { department, role, search, page = 1, pageSize = 20, isActive = true } = opts;

  const where = {
    isActive,
    ...(department && { department }),
    ...(role && { role: role as Employee["role"] }),
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" as const } },
        { lastName: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { jobTitle: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [employees, total] = await Promise.all([
    db.employee.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    db.employee.count({ where }),
  ]);

  return { employees, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function updateEmployee(id: string, data: Partial<Employee>) {
  return db.employee.update({
    where: { id },
    data: {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.department && { department: data.department }),
      ...(data.jobTitle && { jobTitle: data.jobTitle }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.managerId !== undefined && { managerId: data.managerId }),
    },
  });
}

export async function createEmployee(data: {
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  jobTitle: string;
  role?: Employee["role"];
  managerId?: string;
  startDate: Date;
  salary?: number;
  phone?: string;
}) {
  return db.employee.create({ data });
}

export async function deactivateEmployee(id: string) {
  return db.employee.update({ where: { id }, data: { isActive: false } });
}

export async function getEmployeeProfile(id: string) {
  const employee = await db.employee.findUnique({
    where: { id },
    include: {
      manager: { select: { id: true, firstName: true, lastName: true, jobTitle: true } },
      subordinates: { select: { id: true, firstName: true, lastName: true, jobTitle: true } },
      leaveRequests: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!employee) return null;

  const tenureYears = getTenureYears(employee.startDate);
  const leaveEntitlement = calculateLeaveEntitlement(tenureYears);

  return { ...employee, tenureYears, leaveEntitlement };
}

export function calculateLeaveEntitlement(tenureYears: number) {
  return {
    vacation: tenureYears < 2 ? 10 : tenureYears < 5 ? 15 : 20,
    sick: 10,
    personal: 3,
  };
}

export async function getDepartments(): Promise<string[]> {
  const result = await db.employee.findMany({
    where: { isActive: true },
    select: { department: true },
    distinct: ["department"],
    orderBy: { department: "asc" },
  });
  return result.map((r) => r.department);
}
