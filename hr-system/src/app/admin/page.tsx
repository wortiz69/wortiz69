"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const MOCK_EMPLOYEES = [
  { id: "1", name: "Alice Chen", email: "alice@company.com", department: "Engineering", role: "EMPLOYEE", jobTitle: "Senior Engineer", startDate: "2023-03-15", isActive: true },
  { id: "2", name: "Bob Martinez", email: "bob@company.com", department: "Product", role: "MANAGER", jobTitle: "Product Manager", startDate: "2021-06-01", isActive: true },
  { id: "3", name: "Carol Williams", email: "carol@company.com", department: "Design", role: "EMPLOYEE", jobTitle: "UX Designer", startDate: "2024-01-10", isActive: true },
  { id: "4", name: "David Kim", email: "david@company.com", department: "Engineering", role: "HR_ADMIN", jobTitle: "HR Director", startDate: "2019-09-20", isActive: true },
  { id: "5", name: "Eva Garcia", email: "eva@company.com", department: "Analytics", role: "EMPLOYEE", jobTitle: "Data Analyst", startDate: "2025-01-05", isActive: false },
];

const DEPT_HEADCOUNT = [
  { dept: "Engineering", count: 89, pct: 36 },
  { dept: "Product", count: 34, pct: 14 },
  { dept: "Design", count: 22, pct: 9 },
  { dept: "Sales", count: 48, pct: 19 },
  { dept: "Marketing", count: 28, pct: 11 },
  { dept: "Operations", count: 27, pct: 11 },
];

const AUDIT_LOG = [
  { action: "CREATE", resource: "Employee", detail: "Added David Kim", user: "admin@company.com", time: "Apr 17, 2026 09:15" },
  { action: "UPDATE", resource: "Employee", detail: "Updated role for Alice Chen", user: "admin@company.com", time: "Apr 16, 2026 14:30" },
  { action: "APPROVE", resource: "LeaveRequest", detail: "Approved leave for Bob Martinez", user: "manager@company.com", time: "Apr 16, 2026 11:20" },
  { action: "DEACTIVATE", resource: "Employee", detail: "Deactivated Eva Garcia", user: "admin@company.com", time: "Apr 15, 2026 17:00" },
];

const roleVariant: Record<string, "gray" | "blue" | "purple" | "red"> = {
  EMPLOYEE: "gray",
  MANAGER: "blue",
  HR_ADMIN: "purple",
  SUPER_ADMIN: "red",
};

type Tab = "employees" | "headcount" | "audit";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("employees");
  const [search, setSearch] = useState("");

  const filtered = MOCK_EMPLOYEES.filter(
    (e) =>
      !search ||
      `${e.name} ${e.email} ${e.department}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Header
        title="Admin Panel"
        subtitle="User management, reporting, and system settings."
        actions={
          <button className="btn-primary">+ Add Employee</button>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard title="Active Employees" value="247" color="blue" />
        <StatCard title="Departments" value="6" color="green" />
        <StatCard title="HR Admins" value="3" color="purple" />
        <StatCard title="Pending Actions" value="16" color="yellow" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {(["employees", "headcount", "audit"] as Tab[]).map((t) => (
          <button
            key={t}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setTab(t)}
          >
            {t === "headcount" ? "Headcount" : t === "audit" ? "Audit Log" : "Employees"}
          </button>
        ))}
      </div>

      {tab === "employees" && (
        <>
          <div className="mb-4">
            <input
              type="text"
              className="input w-72"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Card padding={false}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Employee", "Department", "Job Title", "Role", "Start Date", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{e.name}</p>
                      <p className="text-xs text-gray-500">{e.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{e.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{e.jobTitle}</td>
                    <td className="px-6 py-4">
                      <Badge variant={roleVariant[e.role] ?? "gray"}>{e.role}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{e.startDate}</td>
                    <td className="px-6 py-4">
                      <Badge variant={e.isActive ? "green" : "gray"}>
                        {e.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button className="text-sm text-primary-600 hover:text-primary-700">Edit</button>
                      {e.isActive && (
                        <button className="text-sm text-red-600 hover:text-red-700">Deactivate</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {tab === "headcount" && (
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Headcount by Department</h3>
            <div className="space-y-3">
              {DEPT_HEADCOUNT.map((d) => (
                <div key={d.dept}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{d.dept}</span>
                    <span className="text-gray-500">{d.count} ({d.pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Reports & Exports</h3>
            <div className="space-y-3">
              {[
                { label: "Employee Directory (CSV)", action: "Download" },
                { label: "Leave Usage Report", action: "Generate" },
                { label: "Recruiting Metrics", action: "Generate" },
                { label: "Performance Summary", action: "Generate" },
                { label: "Turnover Analysis", action: "Generate" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700">{r.label}</span>
                  <button className="btn-secondary text-xs py-1 px-3">{r.action}</button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "audit" && (
        <Card padding={false}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">Audit Log</h2>
            <p className="text-sm text-gray-500">All system changes tracked with timestamps and user attribution.</p>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Action", "Resource", "Detail", "Performed By", "Timestamp"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {AUDIT_LOG.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Badge variant={log.action === "DEACTIVATE" ? "red" : log.action === "CREATE" ? "green" : "blue"}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.resource}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{log.detail}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.user}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
