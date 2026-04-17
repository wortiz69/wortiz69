"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type ReviewStatus = "DRAFT" | "SUBMITTED" | "IN_REVIEW" | "COMPLETED";

interface Review {
  id: string;
  revieweeName: string;
  department: string;
  period: string;
  status: ReviewStatus;
  rating?: number;
  dueDate: string;
  isSelfReview: boolean;
}

const statusVariant: Record<ReviewStatus, "gray" | "yellow" | "blue" | "green"> = {
  DRAFT: "gray",
  SUBMITTED: "yellow",
  IN_REVIEW: "blue",
  COMPLETED: "green",
};

const MOCK_REVIEWS: Review[] = [
  { id: "1", revieweeName: "You (Self)", department: "Engineering", period: "Q1 2026", status: "DRAFT", dueDate: "2026-04-30", isSelfReview: true },
  { id: "2", revieweeName: "Alice Chen", department: "Engineering", period: "Q1 2026", status: "SUBMITTED", dueDate: "2026-04-30", isSelfReview: false },
  { id: "3", revieweeName: "Bob Martinez", department: "Product", period: "Q1 2026", status: "IN_REVIEW", dueDate: "2026-04-30", isSelfReview: false },
  { id: "4", revieweeName: "Carol Williams", department: "Design", period: "Q4 2025", status: "COMPLETED", rating: 4.2, dueDate: "2026-01-15", isSelfReview: false },
  { id: "5", revieweeName: "David Kim", department: "Engineering", period: "Q4 2025", status: "COMPLETED", rating: 3.8, dueDate: "2026-01-15", isSelfReview: false },
];

const RATING_DISTRIBUTION = [
  { label: "5 - Exceptional", count: 8, pct: 12 },
  { label: "4 - Exceeds", count: 24, pct: 36 },
  { label: "3 - Meets", count: 28, pct: 42 },
  { label: "2 - Below", count: 5, pct: 7 },
  { label: "1 - Unsatisfactory", count: 2, pct: 3 },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState<"reviews" | "analytics">("reviews");

  return (
    <div>
      <Header
        title="Performance Reviews"
        subtitle="Track and manage performance evaluations."
        actions={
          <button className="btn-primary">+ Create Review</button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {(["reviews", "analytics"] as const).map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "reviews" ? (
        <Card padding={false}>
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-base font-semibold text-gray-900">Q1 2026 Review Cycle</h2>
            <span className="text-sm text-gray-500">Due Apr 30, 2026</span>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Employee", "Department", "Period", "Status", "Rating", "Due Date", "Action"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {MOCK_REVIEWS.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{r.revieweeName}</p>
                    {r.isSelfReview && (
                      <span className="text-xs text-primary-600 font-medium">Self-Assessment</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.period}</td>
                  <td className="px-6 py-4">
                    <Badge variant={statusVariant[r.status]}>{r.status.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    {r.rating ? <StarRating rating={r.rating} /> : <span className="text-sm text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.dueDate}</td>
                  <td className="px-6 py-4">
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      {r.status === "DRAFT" ? "Continue" : "View"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Rating Distribution — Q4 2025</h3>
            <div className="space-y-3">
              {RATING_DISTRIBUTION.map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{row.label}</span>
                    <span className="text-gray-500">{row.count} ({row.pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Cycle Summary</h3>
            <dl className="space-y-3">
              {[
                { label: "Total Reviews", value: "67" },
                { label: "Completed", value: "63 (94%)" },
                { label: "Average Rating", value: "3.7 / 5.0" },
                { label: "Overdue", value: "4" },
                { label: "Period", value: "Q4 2025" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-sm text-gray-500">{label}</dt>
                  <dd className="text-sm font-medium text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      )}
    </div>
  );
}
