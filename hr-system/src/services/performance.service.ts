import { db } from "@/lib/db";
import type { ReviewStatus } from "@/types";

export async function createReview(data: {
  revieweeId: string;
  reviewerId: string;
  period: string;
  dueDate?: Date;
  goals?: Array<{ description: string }>;
}) {
  return db.performanceReview.create({
    data: {
      ...data,
      status: "DRAFT",
      goals: data.goals ?? [],
    },
  });
}

export async function getReview(id: string) {
  return db.performanceReview.findUnique({
    where: { id },
    include: {
      reviewee: { select: { id: true, firstName: true, lastName: true, jobTitle: true, department: true } },
      reviewer: { select: { id: true, firstName: true, lastName: true, jobTitle: true } },
    },
  });
}

export async function listReviews(opts: {
  revieweeId?: string;
  reviewerId?: string;
  status?: ReviewStatus;
  period?: string;
  page?: number;
  pageSize?: number;
}) {
  const { revieweeId, reviewerId, status, period, page = 1, pageSize = 20 } = opts;

  const where = {
    ...(revieweeId && { revieweeId }),
    ...(reviewerId && { reviewerId }),
    ...(status && { status }),
    ...(period && { period }),
  };

  const [reviews, total] = await Promise.all([
    db.performanceReview.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        reviewee: { select: { id: true, firstName: true, lastName: true, department: true } },
        reviewer: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    db.performanceReview.count({ where }),
  ]);

  return { reviews, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function updateReview(
  id: string,
  data: {
    overallRating?: number;
    goals?: Array<{ description: string; rating?: number; comments?: string }>;
    strengths?: string;
    improvements?: string;
    comments?: string;
    status?: ReviewStatus;
  }
) {
  const update: Record<string, unknown> = { ...data };

  if (data.status === "SUBMITTED") {
    update.submittedAt = new Date();
  } else if (data.status === "COMPLETED") {
    update.completedAt = new Date();
  }

  return db.performanceReview.update({ where: { id }, data: update });
}

export async function getReviewCycleSummary(period: string) {
  const reviews = await db.performanceReview.findMany({
    where: { period },
    select: { overallRating: true, status: true },
  });

  const completed = reviews.filter((r) => r.status === "COMPLETED");
  const ratings = completed
    .map((r) => r.overallRating)
    .filter((r): r is number => r !== null);

  const distribution: Record<string, number> = {
    "5 - Exceptional": 0,
    "4 - Exceeds": 0,
    "3 - Meets": 0,
    "2 - Below": 0,
    "1 - Unsatisfactory": 0,
  };

  for (const rating of ratings) {
    if (rating >= 4.5) distribution["5 - Exceptional"]++;
    else if (rating >= 3.5) distribution["4 - Exceeds"]++;
    else if (rating >= 2.5) distribution["3 - Meets"]++;
    else if (rating >= 1.5) distribution["2 - Below"]++;
    else distribution["1 - Unsatisfactory"]++;
  }

  return {
    period,
    total: reviews.length,
    completed: completed.length,
    pending: reviews.filter((r) => r.status === "PENDING").length,
    averageRating: ratings.length
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : null,
    distribution,
  };
}
