import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, isHRAdmin } from "@/lib/auth";
import {
  getDashboardStats,
  getHeadcountByDepartment,
  getLeaveReport,
  getRecruitingMetrics,
  exportEmployeesCSV,
} from "@/services/reporting.service";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");

  if (type === "dashboard") {
    const stats = await getDashboardStats();
    return NextResponse.json({ data: stats });
  }

  if (!isHRAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (type === "headcount") {
    const data = await getHeadcountByDepartment();
    return NextResponse.json({ data });
  }

  if (type === "leave") {
    const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
    const data = await getLeaveReport(year);
    return NextResponse.json({ data });
  }

  if (type === "recruiting") {
    const data = await getRecruitingMetrics();
    return NextResponse.json({ data });
  }

  if (type === "employees-csv") {
    const csv = await exportEmployeesCSV();
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="employees-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
}
