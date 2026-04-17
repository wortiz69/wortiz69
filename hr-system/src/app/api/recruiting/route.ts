import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser, isHRAdmin, isManager } from "@/lib/auth";
import {
  createCandidate,
  listCandidates,
  getHiringPipelineSummary,
} from "@/services/recruiting.service";

const createCandidateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  position: z.string().min(1),
  department: z.string().optional(),
  resumeUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || !isManager(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;

  if (searchParams.get("summary") === "pipeline") {
    const summary = await getHiringPipelineSummary();
    return NextResponse.json({ data: summary });
  }

  const result = await listCandidates({
    position: searchParams.get("position") ?? undefined,
    department: searchParams.get("department") ?? undefined,
    stage: searchParams.get("stage") as Parameters<typeof listCandidates>[0]["stage"],
    search: searchParams.get("search") ?? undefined,
    page: parseInt(searchParams.get("page") ?? "1"),
    pageSize: parseInt(searchParams.get("pageSize") ?? "20"),
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || !isHRAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createCandidateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const candidate = await createCandidate(parsed.data);
  return NextResponse.json({ data: candidate }, { status: 201 });
}
