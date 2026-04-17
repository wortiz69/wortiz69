import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const BENEFITS = [
  {
    category: "Health",
    icon: "❤️",
    color: "red",
    items: [
      { name: "Premium Health Plan", status: "Enrolled", details: "Blue Cross PPO — $500 deductible, $2,000 OOP max", renewalDate: "Jan 1, 2027" },
      { name: "Dental Plus", status: "Enrolled", details: "100% preventive, 80% basic, 50% major", renewalDate: "Jan 1, 2027" },
      { name: "Vision Basic", status: "Enrolled", details: "$150 frame allowance, 1 eye exam/year", renewalDate: "Jan 1, 2027" },
    ],
  },
  {
    category: "Financial",
    icon: "💰",
    color: "green",
    items: [
      { name: "401(k) Retirement Plan", status: "Enrolled", details: "6% contribution · 4% company match", renewalDate: "Ongoing" },
      { name: "HSA Account", status: "Enrolled", details: "Balance: $1,240 · Annual limit: $4,150", renewalDate: "Dec 31, 2026" },
      { name: "Life Insurance", status: "Enrolled", details: "2x annual salary ($240,000 coverage)", renewalDate: "Jan 1, 2027" },
      { name: "Short-Term Disability", status: "Enrolled", details: "60% of salary for up to 12 weeks", renewalDate: "Jan 1, 2027" },
    ],
  },
  {
    category: "Wellness",
    icon: "🌿",
    color: "blue",
    items: [
      { name: "EAP (Employee Assistance Program)", status: "Enrolled", details: "Free counseling, legal, financial advising", renewalDate: "Ongoing" },
      { name: "Gym Reimbursement", status: "Not Enrolled", details: "$75/month towards gym membership", renewalDate: "Open Enrollment" },
      { name: "Mental Health Days", status: "Enrolled", details: "3 additional paid days per year", renewalDate: "Jan 1, 2027" },
    ],
  },
  {
    category: "Time Off",
    icon: "🏖️",
    color: "purple",
    items: [
      { name: "Paid Vacation", status: "Active", details: "15 days/year (increases to 20 at 5 years)", renewalDate: "Annually" },
      { name: "Sick Leave", status: "Active", details: "10 days/year", renewalDate: "Annually" },
      { name: "Parental Leave", status: "Active", details: "12 weeks primary / 4 weeks secondary caregiver", renewalDate: "Per event" },
    ],
  },
];

const OPEN_ENROLLMENT = {
  start: "November 1, 2026",
  end: "November 15, 2026",
  effective: "January 1, 2027",
};

export default function BenefitsPage() {
  return (
    <div>
      <Header
        title="Benefits Portal"
        subtitle="View and manage your current benefits enrollment."
        actions={
          <button className="btn-secondary">Download Summary (PDF)</button>
        }
      />

      {/* Open Enrollment Banner */}
      <div className="mb-6 rounded-xl bg-primary-50 border border-primary-200 p-4 flex items-start gap-4">
        <div className="flex-shrink-0 text-2xl">📅</div>
        <div>
          <p className="text-sm font-semibold text-primary-900">Open Enrollment is Coming</p>
          <p className="text-sm text-primary-700">
            {OPEN_ENROLLMENT.start} – {OPEN_ENROLLMENT.end} · Changes effective {OPEN_ENROLLMENT.effective}
          </p>
        </div>
        <button className="ml-auto btn-primary text-xs">Plan Changes</button>
      </div>

      {/* Benefits by Category */}
      <div className="space-y-6">
        {BENEFITS.map((cat) => (
          <div key={cat.category}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{cat.icon}</span>
              <h2 className="text-base font-semibold text-gray-900">{cat.category}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cat.items.map((item) => (
                <Card key={item.name} className="flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                    <Badge
                      variant={
                        item.status === "Enrolled" || item.status === "Active"
                          ? "green"
                          : "gray"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{item.details}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">Renewal: {item.renewalDate}</p>
                    {item.status === "Not Enrolled" && (
                      <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                        Enroll Now
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <Card className="mt-8 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Need Help?</h3>
        <p className="text-sm text-gray-600">
          Contact the Benefits team at{" "}
          <a href="mailto:benefits@company.com" className="text-primary-600 font-medium">
            benefits@company.com
          </a>{" "}
          or call (555) 123-4567 Mon–Fri 9am–5pm.
        </p>
      </Card>
    </div>
  );
}
