// components/godmode/GoaHeatmap.tsx
"use client";

import React from "react";

export default function GoaHeatmap() {
  // Simple placeholder (kept from earlier). You can replace with real map/tiles later.
  const rows = [
    { name: "CRZ-I (Ecologically Sensitive)", weight: 0.95 },
    { name: "CRZ-II (Developed Areas)", weight: 0.55 },
    { name: "CRZ-III (Undeveloped)", weight: 0.65 },
    { name: "CRZ-IV (Water Area)", weight: 0.45 },
    { name: "Industrial Cluster Proximity", weight: 0.35 },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {rows.map((r) => (
        <div
          key={r.name}
          className="rounded-xl border border-[var(--border-1)] bg-[var(--glass)] p-3"
        >
          <div className="text-sm font-medium mb-1">{r.name}</div>
          <div className="w-full h-3 rounded bg-white/10 overflow-hidden">
            <div
              className="h-full"
              style={{
                width: `${Math.round(r.weight * 100)}%`,
                background:
                  "linear-gradient(90deg, rgba(94,234,212,0.5), rgba(59,130,246,0.55))",
              }}
            />
          </div>
          <div className="mt-1 text-xs text-[var(--text-2)]">
            Risk/priority: {Math.round(r.weight * 100)}%
          </div>
        </div>
      ))}
    </div>
  );
}
