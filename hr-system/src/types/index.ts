export type Role = "EMPLOYEE" | "MANAGER" | "HR_ADMIN" | "SUPER_ADMIN";

export type LeaveType =
  | "VACATION"
  | "SICK"
  | "PERSONAL"
  | "MATERNITY"
  | "PATERNITY"
  | "BEREAVEMENT"
  | "UNPAID";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type ReviewStatus = "DRAFT" | "SUBMITTED" | "IN_REVIEW" | "COMPLETED";

export type CandidateStage =
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED";

export interface Employee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  department: string;
  jobTitle: string;
  managerId?: string;
  startDate: Date;
  salary?: number;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee?: Pick<Employee, "id" | "firstName" | "lastName" | "department">;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  days: number;
  reason?: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveBalance {
  vacation: number;
  sick: number;
  personal: number;
  used: Record<LeaveType, number>;
}

export interface PerformanceReview {
  id: string;
  revieweeId: string;
  reviewee?: Pick<Employee, "id" | "firstName" | "lastName">;
  reviewerId: string;
  reviewer?: Pick<Employee, "id" | "firstName" | "lastName">;
  period: string;
  overallRating?: number;
  goals?: ReviewGoal[];
  strengths?: string;
  improvements?: string;
  comments?: string;
  status: ReviewStatus;
  dueDate?: Date;
  submittedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewGoal {
  description: string;
  rating?: number;
  comments?: string;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  stage: CandidateStage;
  fitScore?: number;
  resumeUrl?: string;
  linkedinUrl?: string;
  notes?: string;
  appliedAt: Date;
  interviews?: Interview[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Interview {
  id: string;
  candidateId: string;
  interviewerId: string;
  scheduledAt: Date;
  duration: number;
  type: string;
  notes?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  employeeId: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
  sessionId: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalEmployees: number;
  activeLeaveRequests: number;
  pendingReviews: number;
  openPositions: number;
  newHiresThisMonth: number;
  turnoverRate: number;
}

export interface HRReport {
  type: string;
  generatedAt: Date;
  data: Record<string, unknown>;
  format: "json" | "csv" | "pdf";
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
