// components/godmode/ComplianceHeatmap.tsx
"use client";

import * as React from "react";

type Region = {
  name: string;
  score: number; // % compliant
};

const sampleRegions: Region[] = [
  { name: "North Goa", score: 72 },
  { name: "South Goa", score: 54 },
  { name: "Panaji", score: 81 },
];

function getColor(score: number) {
  if (score >= 75) return "bg-green-600/40 border-green-400/50";
  if (score >= 50) return "bg-yellow-600/40 border-yellow-400/50";
  return "bg-red-600/40 border-red-400/50";
}

export default function ComplianceHeatmap() {
  return (
    <div className="p-6 rounded-2xl bg-[var(--glass)] border border-[var(--border-1)] backdrop-blur">
      <h2 className="text-lg font-semibold mb-4">Compliance Heatmap (Goa)</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {sampleRegions.map((r) => (
          <div
            key={r.name}
            className={`p-4 rounded-xl border text-center ${getColor(r.score)}`}
          >
            <div className="text-sm font-medium text-[var(--text-1)]">
              {r.name}
            </div>
            <div className="text-2xl font-bold text-[var(--text-1)] mt-1">
              {r.score}%
            </div>
            <div className="text-xs text-[var(--text-2)]">compliant</div>
          </div>
        ))}
      </div>
      <div className="text-xs text-[var(--text-2)] mt-4">
        [Placeholder] Future: Interactive Goa map with CRZ zones + MSME clusters
      </div>
    </div>
  );
}
