import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getLeaveBalance } from "@/services/leave.service";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const employeeId = req.nextUrl.searchParams.get("employeeId") ?? user.id;

  // Non-admins can only view their own balance
  if (employeeId !== user.id && user.role !== "HR_ADMIN" && user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const balance = await getLeaveBalance(employeeId);
  return NextResponse.json({ data: balance });
}
