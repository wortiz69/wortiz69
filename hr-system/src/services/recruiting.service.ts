import { db } from "@/lib/db";
import type { CandidateStage } from "@/types";

export async function createCandidate(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  notes?: string;
}) {
  return db.candidate.create({ data });
}

export async function listCandidates(opts: {
  position?: string;
  department?: string;
  stage?: CandidateStage;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const { position, department, stage, search, page = 1, pageSize = 20 } = opts;

  const where = {
    ...(position && { position }),
    ...(department && { department }),
    ...(stage && { stage }),
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" as const } },
        { lastName: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { position: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [candidates, total] = await Promise.all([
    db.candidate.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { appliedAt: "desc" },
      include: { interviews: { orderBy: { scheduledAt: "asc" } } },
    }),
    db.candidate.count({ where }),
  ]);

  return { candidates, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function updateCandidateStage(id: string, stage: CandidateStage) {
  return db.candidate.update({ where: { id }, data: { stage } });
}

export async function updateCandidateFitScore(id: string, fitScore: number) {
  return db.candidate.update({ where: { id }, data: { fitScore } });
}

export async function scheduleInterview(data: {
  candidateId: string;
  interviewerId: string;
  scheduledAt: Date;
  duration: number;
  type: string;
}) {
  const interview = await db.interview.create({ data });
  await db.candidate.update({
    where: { id: data.candidateId },
    data: { stage: "INTERVIEW" },
  });
  return interview;
}

export async function submitInterviewFeedback(
  interviewId: string,
  data: { notes: string; rating: number }
) {
  return db.interview.update({
    where: { id: interviewId },
    data,
  });
}

export async function getHiringPipelineSummary() {
  const stages = await db.candidate.groupBy({
    by: ["stage"],
    _count: { stage: true },
  });

  const openPositions = await db.candidate.findMany({
    where: { stage: { notIn: ["HIRED", "REJECTED"] } },
    select: { position: true },
    distinct: ["position"],
  });

  return {
    stageCounts: Object.fromEntries(
      stages.map((s) => [s.stage, s._count.stage])
    ),
    openPositionsCount: openPositions.length,
  };
}
