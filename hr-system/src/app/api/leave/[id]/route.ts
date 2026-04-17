import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser, isManager } from "@/lib/auth";
import {
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
} from "@/services/leave.service";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({ action: z.literal("reject"), rejectionNote: z.string().min(1) }),
  z.object({ action: z.literal("cancel") }),
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    if (parsed.data.action === "approve") {
      if (!isManager(user)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const result = await approveLeaveRequest(params.id, user.id);
      return NextResponse.json({ data: result });
    }

    if (parsed.data.action === "reject") {
      if (!isManager(user)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const result = await rejectLeaveRequest(params.id, parsed.data.rejectionNote);
      return NextResponse.json({ data: result });
    }

    if (parsed.data.action === "cancel") {
      const result = await cancelLeaveRequest(params.id, user.id);
      return NextResponse.json({ data: result });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Action failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
