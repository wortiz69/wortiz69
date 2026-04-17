import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser, isHRAdmin } from "@/lib/auth";
import {
  getEmployeeProfile,
  updateEmployee,
  deactivateEmployee,
} from "@/services/employee.service";
import { db } from "@/lib/db";

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
  phone: z.string().nullable().optional(),
  managerId: z.string().nullable().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Employees can view their own profile; HR admins can view any
  if (user.id !== params.id && !isHRAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await getEmployeeProfile(params.id);
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: profile });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(req);
  if (!user || !isHRAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await updateEmployee(params.id, parsed.data as Parameters<typeof updateEmployee>[1]);

  await db.auditLog.create({
    data: {
      employeeId: user.id,
      action: "UPDATE",
      resource: "Employee",
      resourceId: params.id,
      changes: parsed.data as Record<string, unknown>,
    },
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(req);
  if (!user || !isHRAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await deactivateEmployee(params.id);

  await db.auditLog.create({
    data: {
      employeeId: user.id,
      action: "DEACTIVATE",
      resource: "Employee",
      resourceId: params.id,
    },
  });

  return NextResponse.json({ message: "Employee deactivated" });
}
