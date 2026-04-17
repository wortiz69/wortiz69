import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/ui/Card";

const MOCK_STATS = {
  totalEmployees: 248,
  activeLeaveRequests: 12,
  pendingReviews: 34,
  openPositions: 7,
  newHiresThisMonth: 5,
  turnoverRate: 3.2,
};

const quickActions = [
  { label: "Request Leave", href: "/leave/new", color: "bg-blue-600" },
  { label: "HR Chat", href: "/chat", color: "bg-purple-600" },
  { label: "My Reviews", href: "/performance", color: "bg-green-600" },
  { label: "Benefits Info", href: "/benefits", color: "bg-orange-600" },
];

const recentActivity = [
  { action: "Leave request approved", user: "Jane Smith", time: "2 hours ago", type: "leave" },
  { action: "Performance review submitted", user: "Mark Johnson", time: "4 hours ago", type: "review" },
  { action: "New candidate applied", user: "Senior Engineer", time: "6 hours ago", type: "recruit" },
  { action: "Employee onboarded", user: "Sarah Lee", time: "1 day ago", type: "onboard" },
  { action: "Leave request pending", user: "Tom Davis", time: "1 day ago", type: "leave" },
];

const activityTypeColors: Record<string, string> = {
  leave: "bg-blue-100 text-blue-700",
  review: "bg-green-100 text-green-700",
  recruit: "bg-purple-100 text-purple-700",
  onboard: "bg-orange-100 text-orange-700",
};

export default function DashboardPage() {
  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Welcome back — here's what's happening today."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard
          title="Total Employees"
          value={MOCK_STATS.totalEmployees}
          subtitle="Active headcount"
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          title="Pending Leave Requests"
          value={MOCK_STATS.activeLeaveRequests}
          subtitle="Awaiting approval"
          color="yellow"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          title="Pending Reviews"
          value={MOCK_STATS.pendingReviews}
          subtitle="Performance cycle"
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <StatCard
          title="Open Positions"
          value={MOCK_STATS.openPositions}
          subtitle="Active recruiting"
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          title="New Hires This Month"
          value={MOCK_STATS.newHiresThisMonth}
          subtitle="Onboarded recently"
          color="blue"
          trend={{ value: 25, label: "vs last month" }}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          }
        />
        <StatCard
          title="Turnover Rate"
          value={`${MOCK_STATS.turnoverRate}%`}
          subtitle="Last 12 months"
          color="red"
          trend={{ value: -0.5, label: "vs prior year" }}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <a
                key={action.label}
                href={action.href}
                className={`${action.color} text-white text-sm font-medium rounded-lg px-4 py-3 text-center hover:opacity-90 transition-opacity`}
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <ul className="space-y-3">
            {recentActivity.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${activityTypeColors[item.type]}`}
                >
                  {item.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{item.action}</p>
                  <p className="text-xs text-gray-500">{item.user} · {item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
