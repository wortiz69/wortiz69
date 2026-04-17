import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser, isManager } from "@/lib/auth";
import {
  createLeaveRequest,
  listLeaveRequests,
  getLeaveBalance,
} from "@/services/leave.service";

const createLeaveSchema = z.object({
  type: z.enum(["VACATION", "SICK", "PERSONAL", "MATERNITY", "PATERNITY", "BEREAVEMENT", "UNPAID"]),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  reason: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");
  const view = searchParams.get("view");

  // Managers can view their team's requests; employees see only their own
  const opts = {
    status: searchParams.get("status") as Parameters<typeof listLeaveRequests>[0]["status"],
    year: searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined,
    page,
    pageSize,
    ...(view === "team" && isManager(user)
      ? { managerId: user.id }
      : { employeeId: user.id }),
  };

  const result = await listLeaveRequests(opts);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createLeaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.endDate < parsed.data.startDate) {
    return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
  }

  try {
    const request = await createLeaveRequest({
      employeeId: user.id,
      ...parsed.data,
    });
    return NextResponse.json({ data: request }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create request";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
