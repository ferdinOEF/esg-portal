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
  const [items] = React.useState<NewsItem[]>(sampleNews);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [explanations, setExplanations] = React.useState<Record<string, string>>(
    {}
  );
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  async function explain(item: NewsItem) {
    try {
      setErrors((e) => ({ ...e, [item.id]: "" }));
      setLoadingId(item.id);
      const res = await fetch("/api/esg/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          summary: item.summary,
          source: item.source,
          publishedAt: item.publishedAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to explain");
      setExplanations((m) => ({ ...m, [item.id]: data.explanation }));
    } catch (err: any) {
      setErrors((e) => ({ ...e, [item.id]: err?.message || "Error" }));
    } finally {
      setLoadingId(null);
    }
  }

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
            <p className="text-sm text-[var(--text-2)] mt-2">{n.summary}</p>

            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => explain(n)}
                disabled={loadingId === n.id}
                className="text-xs px-2 py-1 rounded border border-[var(--border-1)] hover:shadow-glow disabled:opacity-60"
              >
                {loadingId === n.id ? "Analyzing…" : "Explain for MSMEs →"}
              </button>

              {errors[n.id] ? (
                <span className="text-xs text-red-400">{errors[n.id]}</span>
              ) : null}
            </div>

            {explanations[n.id] && (
              <div className="mt-3 p-3 rounded-lg bg-[var(--glass)] border border-[var(--border-1)] text-sm text-[var(--text-1)] whitespace-pre-wrap">
                {explanations[n.id]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
