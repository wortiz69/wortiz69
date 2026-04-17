import { NextRequest } from "next/server";
import { db } from "./db";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const session = await db.userSession.findUnique({
    where: { token },
    include: {
      employee: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          department: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) return null;

  return session.employee;
}

export function requireRole(user: AuthUser | null, ...roles: string[]): void {
  if (!user) throw new Error("Unauthorized");
  if (!roles.includes(user.role)) throw new Error("Forbidden");
}

export function isHRAdmin(user: AuthUser): boolean {
  return user.role === "HR_ADMIN" || user.role === "SUPER_ADMIN";
}

export function isManager(user: AuthUser): boolean {
  return (
    user.role === "MANAGER" ||
    user.role === "HR_ADMIN" ||
    user.role === "SUPER_ADMIN"
  );
}
