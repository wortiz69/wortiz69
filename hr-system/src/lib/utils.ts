import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInBusinessDays, format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy h:mm a");
}

export function calculateBusinessDays(start: Date, end: Date): number {
  return differenceInBusinessDays(end, start) + 1;
}

export function getTenureYears(startDate: Date): number {
  const now = new Date();
  return (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): { data: T[]; total: number; totalPages: number } {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const data = items.slice((page - 1) * pageSize, page * pageSize);
  return { data, total, totalPages };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
