import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser, isHRAdmin, isManager } from "@/lib/auth";
import { createReview, listReviews } from "@/services/performance.service";

const createReviewSchema = z.object({
  revieweeId: z.string(),
  period: z.string().min(1),
  dueDate: z
    .string()
    .optional()
    .transform((s) => (s ? new Date(s) : undefined)),
  goals: z
    .array(z.object({ description: z.string() }))
    .optional(),
});

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");

  const opts = {
    status: searchParams.get("status") as Parameters<typeof listReviews>[0]["status"],
    period: searchParams.get("period") ?? undefined,
    page,
    pageSize,
    // Non-admins see only reviews they're involved in
    ...(isHRAdmin(user)
      ? {}
      : isManager(user)
      ? { reviewerId: user.id }
      : { revieweeId: user.id }),
  };

  const result = await listReviews(opts);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || !isManager(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const review = await createReview({
    ...parsed.data,
    reviewerId: user.id,
  });

  return NextResponse.json({ data: review }, { status: 201 });
}
