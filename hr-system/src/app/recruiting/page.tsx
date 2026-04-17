"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge, candidateStageVariant } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

type CandidateStage = "APPLIED" | "SCREENING" | "INTERVIEW" | "OFFER" | "HIRED" | "REJECTED";

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  stage: CandidateStage;
  fitScore?: number;
  appliedAt: string;
}

const MOCK_PIPELINE: Record<CandidateStage, number> = {
  APPLIED: 42,
  SCREENING: 18,
  INTERVIEW: 9,
  OFFER: 3,
  HIRED: 24,
  REJECTED: 57,
};

const MOCK_CANDIDATES: Candidate[] = [
  { id: "1", firstName: "Alice", lastName: "Chen", email: "alice@example.com", position: "Senior Engineer", department: "Engineering", stage: "INTERVIEW", fitScore: 87, appliedAt: "2026-04-01" },
  { id: "2", firstName: "Bob", lastName: "Martinez", email: "bob@example.com", position: "Product Manager", department: "Product", stage: "SCREENING", fitScore: 72, appliedAt: "2026-04-05" },
  { id: "3", firstName: "Carol", lastName: "Williams", email: "carol@example.com", position: "Designer", department: "Design", stage: "OFFER", fitScore: 91, appliedAt: "2026-03-20" },
  { id: "4", firstName: "David", lastName: "Kim", email: "david@example.com", position: "Senior Engineer", department: "Engineering", stage: "APPLIED", fitScore: 65, appliedAt: "2026-04-10" },
  { id: "5", firstName: "Eva", lastName: "Garcia", email: "eva@example.com", position: "Data Analyst", department: "Analytics", stage: "HIRED", fitScore: 88, appliedAt: "2026-03-01" },
];

const stageColors: Record<CandidateStage, string> = {
  APPLIED: "bg-gray-100",
  SCREENING: "bg-orange-100",
  INTERVIEW: "bg-blue-100",
  OFFER: "bg-purple-100",
  HIRED: "bg-green-100",
  REJECTED: "bg-red-50",
};

export default function RecruitingPage() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<CandidateStage | "ALL">("ALL");

  const filtered = MOCK_CANDIDATES.filter((c) => {
    const matchesSearch =
      !search ||
      `${c.firstName} ${c.lastName} ${c.position}`.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === "ALL" || c.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div>
      <Header
        title="Recruiting"
        subtitle="Track candidates and manage the hiring pipeline."
        actions={
          <button className="btn-primary">+ Add Candidate</button>
        }
      />

      {/* Pipeline Summary */}
      <div className="grid grid-cols-6 gap-3 mb-8">
        {(Object.entries(MOCK_PIPELINE) as [CandidateStage, number][]).map(([stage, count]) => (
          <div
            key={stage}
            className={`card p-4 cursor-pointer transition-shadow hover:shadow-md ${stageColors[stage]}`}
            onClick={() => setStageFilter(stage === stageFilter ? "ALL" : stage)}
          >
            <p className="text-xs font-medium text-gray-500 uppercase">{stage}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          className="input w-72"
          placeholder="Search candidates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input w-48"
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value as CandidateStage | "ALL")}
        >
          <option value="ALL">All Stages</option>
          {Object.keys(MOCK_PIPELINE).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Candidate Table */}
      <Card padding={false}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Candidate", "Position", "Department", "Stage", "Fit Score", "Applied"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-gray-500">{c.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{c.position}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.department}</td>
                <td className="px-6 py-4">
                  <Badge variant={candidateStageVariant(c.stage)}>{c.stage}</Badge>
                </td>
                <td className="px-6 py-4">
                  {c.fitScore !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-20">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${c.fitScore}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{c.fitScore}%</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(c.appliedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
