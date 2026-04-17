import { db } from "@/lib/db";
import { streamHRChat } from "@/lib/anthropic";
import { getEmployeeProfile } from "./employee.service";
import { getLeaveBalance } from "./leave.service";

export async function getChatHistory(employeeId: string, sessionId: string) {
  return db.chatMessage.findMany({
    where: { employeeId, sessionId },
    orderBy: { createdAt: "asc" },
  });
}

export async function saveChatMessage(data: {
  employeeId: string;
  role: "user" | "assistant";
  content: string;
  sessionId: string;
  intent?: string;
}) {
  return db.chatMessage.create({ data });
}

export async function buildEmployeeContext(employeeId: string): Promise<string> {
  const [profile, leaveBalance] = await Promise.all([
    getEmployeeProfile(employeeId),
    getLeaveBalance(employeeId),
  ]);

  if (!profile) return "Employee profile not found.";

  return `
Employee: ${profile.firstName} ${profile.lastName}
Job Title: ${profile.jobTitle}
Department: ${profile.department}
Manager: ${profile.manager ? `${profile.manager.firstName} ${profile.manager.lastName}` : "None"}
Tenure: ${profile.tenureYears.toFixed(1)} years

Leave Balances (Current Year):
- Vacation: ${leaveBalance.vacation.remaining}/${leaveBalance.vacation.entitlement} days remaining
- Sick: ${leaveBalance.sick.remaining}/${leaveBalance.sick.entitlement} days remaining
- Personal: ${leaveBalance.personal.remaining}/${leaveBalance.personal.entitlement} days remaining
`.trim();
}

export async function streamChatResponse(
  employeeId: string,
  sessionId: string,
  userMessage: string
) {
  const [history, employeeContext] = await Promise.all([
    getChatHistory(employeeId, sessionId),
    buildEmployeeContext(employeeId),
  ]);

  const messages = [
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  await saveChatMessage({
    employeeId,
    role: "user",
    content: userMessage,
    sessionId,
  });

  const stream = await streamHRChat(messages, employeeContext);
  return stream;
}

export async function getSessionList(employeeId: string) {
  const sessions = await db.chatMessage.findMany({
    where: { employeeId, role: "user" },
    select: { sessionId: true, content: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    distinct: ["sessionId"],
    take: 20,
  });

  return sessions.map((s) => ({
    sessionId: s.sessionId,
    preview: s.content.slice(0, 60),
    lastActivity: s.createdAt,
  }));
}
