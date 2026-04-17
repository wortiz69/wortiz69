"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge, leaveStatusVariant } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
type LeaveType = "VACATION" | "SICK" | "PERSONAL" | "MATERNITY" | "PATERNITY" | "BEREAVEMENT" | "UNPAID";

interface LeaveRequest {
  id: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  reason?: string;
}

const MOCK_BALANCE = {
  vacation: { entitlement: 15, used: 5, remaining: 10 },
  sick: { entitlement: 10, used: 2, remaining: 8 },
  personal: { entitlement: 3, used: 1, remaining: 2 },
};

const MOCK_REQUESTS: LeaveRequest[] = [
  { id: "1", type: "VACATION", startDate: "2026-05-10", endDate: "2026-05-17", days: 5, status: "PENDING", reason: "Family vacation" },
  { id: "2", type: "SICK", startDate: "2026-03-15", endDate: "2026-03-16", days: 2, status: "APPROVED" },
  { id: "3", type: "PERSONAL", startDate: "2026-02-20", endDate: "2026-02-20", days: 1, status: "APPROVED", reason: "Appointment" },
  { id: "4", type: "VACATION", startDate: "2026-01-02", endDate: "2026-01-03", days: 2, status: "REJECTED", reason: "New Year break" },
];

interface NewLeaveForm {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export default function LeavePage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewLeaveForm>({
    type: "VACATION",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, POST /api/leave
    alert("Leave request submitted! (Demo mode)");
    setShowForm(false);
  };

  return (
    <div>
      <Header
        title="Leave Management"
        subtitle="Manage your time off requests and balances."
        actions={
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Request Leave
          </button>
        }
      />

      {/* Leave Balance */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {Object.entries(MOCK_BALANCE).map(([type, bal]) => (
          <Card key={type}>
            <p className="text-sm font-medium text-gray-500 capitalize">{type}</p>
            <div className="mt-2 flex items-end gap-1">
              <span className="text-3xl font-bold text-gray-900">{bal.remaining}</span>
              <span className="text-sm text-gray-400 mb-1">/ {bal.entitlement} days</span>
            </div>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${(bal.remaining / bal.entitlement) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">{bal.used} used this year</p>
          </Card>
        ))}
      </div>

      {/* New Leave Request Form */}
      {showForm && (
        <Card className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">New Leave Request</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Leave Type</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as LeaveType })}
              >
                {["VACATION", "SICK", "PERSONAL", "MATERNITY", "PATERNITY", "BEREAVEMENT", "UNPAID"].map((t) => (
                  <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1" />
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                className="input"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">End Date</label>
              <input
                type="date"
                className="input"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="label">Reason (optional)</label>
              <textarea
                className="input"
                rows={3}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Brief description..."
              />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Submit Request</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {/* Leave Requests Table */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">My Leave Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Type", "Start Date", "End Date", "Days", "Status", "Reason"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {MOCK_REQUESTS.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 capitalize">
                    {req.type.toLowerCase()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(req.startDate)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(req.endDate)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{req.days}</td>
                  <td className="px-6 py-4">
                    <Badge variant={leaveStatusVariant(req.status)}>{req.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{req.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
