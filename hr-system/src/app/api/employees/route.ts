import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser, isHRAdmin } from "@/lib/auth";
import {
  listEmployees,
  createEmployee,
  getDepartments,
} from "@/services/employee.service";
import { db } from "@/lib/db";

const createEmployeeSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  department: z.string().min(1),
  jobTitle: z.string().min(1),
  role: z.enum(["EMPLOYEE", "MANAGER", "HR_ADMIN", "SUPER_ADMIN"]).optional(),
  managerId: z.string().optional(),
  startDate: z.string().transform((s) => new Date(s)),
  salary: z.number().positive().optional(),
  phone: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");

  const result = await listEmployees({
    department: searchParams.get("department") ?? undefined,
    role: searchParams.get("role") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    isActive: searchParams.get("isActive") !== "false",
    page,
    pageSize,
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || !isHRAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createEmployeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const employee = await createEmployee(parsed.data);

  await db.auditLog.create({
    data: {
      employeeId: user.id,
      action: "CREATE",
      resource: "Employee",
      resourceId: employee.id,
      changes: parsed.data as Record<string, unknown>,
    },
  });

  return NextResponse.json({ data: employee }, { status: 201 });
}
