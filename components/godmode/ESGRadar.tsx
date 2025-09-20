// components/godmode/ESGRadar.tsx
"use client";

import * as React from "react";

type NewsItem = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  summary: string;
};

const sampleNews: NewsItem[] = [
  {
    id: "1",
    title: "EU CBAM enters transitional phase",
    source: "EU Commission",
    publishedAt: "2025-09-01",
    summary:
      "The Carbon Border Adjustment Mechanism begins its transitional phase. Exporters of steel, cement, and aluminum must file quarterly carbon declarations.",
  },
  {
    id: "2",
    title: "MCA revises BRSR framework for listed MSMEs",
    source: "Ministry of Corporate Affairs",
    publishedAt: "2025-08-15",
    summary:
      "The updated BRSR Core introduces streamlined disclosures for smaller listed companies, reducing compliance burden while ensuring material ESG reporting.",
  },
];

export default function ESGRadar() {
  const [items, setItems] = React.useState<NewsItem[]>(sampleNews);

  return (
    <div className="p-4 rounded-2xl bg-[var(--glass)] border border-[var(--border-1)] backdrop-blur space-y-4">
      <h2 className="text-lg font-semibold">ESG Radar</h2>
      <div className="space-y-3">
        {items.map((n) => (
          <div
            key={n.id}
            className="p-3 rounded-xl bg-[var(--chip)] border border-[var(--chip-border)]"
          >
            <div className="text-sm font-medium text-[var(--text-1)]">
              {n.title}
            </div>
            <div className="text-xs text-[var(--text-2)] mt-1">
              {n.source} · {new Date(n.publishedAt).toLocaleDateString()}
            </div>
            <p className="text-sm text-[var(--text-2)] mt-2 line-clamp-3">
              {n.summary}
            </p>
            <button className="mt-2 text-xs px-2 py-1 rounded border border-[var(--border-1)] hover:shadow-glow">
              Explain for MSMEs →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
