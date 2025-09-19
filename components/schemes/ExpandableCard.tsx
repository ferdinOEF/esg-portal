// components/schemes/ExpandableCard.tsx
"use client";

import { useId, useEffect, useMemo } from "react";
import Link from "next/link";

type RefItem = { label?: string; url?: string; filename?: string };
type Scheme = {
  id: string;
  code: string;
  title: string;
  category: string;
  issuingAuthority?: string | null;
  mandatory: boolean;
  description?: string | null;
  eligibility?: string | null;
  process?: string | null;
  benefits?: string | null;
  deadlines?: string | null;
  features: string[];
  tags: string[];
  references: RefItem[];
};

function categoryAccent(category: string) {
  // deterministic but simple color mapping
  const colors = [
    "border-l-4 border-emerald-500",
    "border-l-4 border-sky-500",
    "border-l-4 border-amber-500",
    "border-l-4 border-violet-500",
    "border-l-4 border-rose-500",
  ];
  let sum = 0;
  for (let i = 0; i < category.length; i++) sum += category.charCodeAt(i);
  return colors[sum % colors.length];
}

export default function ExpandableCard({
  scheme,
  isOpen,
  onToggle,
}: {
  scheme: Scheme;
  isOpen: boolean;
  onToggle: (next: boolean) => void;
}) {
  const regionId = useId();

  // Keep the URL open param synced
  useEffect(() => {
    const usp = new URLSearchParams(window.location.search);
    if (isOpen) usp.set("open", scheme.code);
    else usp.delete("open");
    const url = `${window.location.pathname}${usp.toString() ? `?${usp.toString()}` : ""}`;
    window.history.replaceState(null, "", url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const tagSlice = useMemo(() => (scheme.tags || []).slice(0, 3), [scheme.tags]);

  return (
    <div className={`rounded-2xl border bg-white p-4 ${categoryAccent(scheme.category)}`}>
      <div className="pl-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate" title={scheme.title}>{scheme.title}</h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded ${
                  scheme.mandatory ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {scheme.mandatory ? "Mandatory" : "Voluntary"}
              </span>
            </div>
            <div className="text-xs text-gray-600 truncate">{scheme.issuingAuthority || "—"}</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {tagSlice.map((t) => (
                <span key={t} className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                  #{t}
                </span>
              ))}
              {(scheme.tags?.length || 0) > tagSlice.length ? (
                <span className="text-[11px] text-gray-500">+{(scheme.tags?.length || 0) - tagSlice.length}</span>
              ) : null}
            </div>
          </div>
          <button
            aria-expanded={isOpen}
            aria-controls={regionId}
            onClick={() => onToggle(!isOpen)}
            className="text-sm px-3 py-2 rounded border hover:bg-gray-50 shrink-0 inline-flex items-center gap-1"
          >
            <span>Details</span>
            <svg className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"/>
            </svg>
          </button>
        </div>

        <div
          id={regionId}
          role="region"
          aria-label={`${scheme.title} details`}
          className={`mt-3 grid gap-4 transition-all duration-200 ease-out ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {isOpen && (
            <>
              {scheme.description && (
                <section>
                  <h4 className="text-sm font-medium mb-1">Overview</h4>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{scheme.description}</p>
                </section>
              )}

              {scheme.features?.length ? (
                <section>
                  <h4 className="text-sm font-medium mb-1">Key Features / Obligations</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {scheme.features.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                </section>
              ) : null}

              <div className="grid md:grid-cols-2 gap-4">
                {scheme.eligibility && (
                  <section>
                    <h4 className="text-sm font-medium mb-1">Eligibility / Applicability</h4>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{scheme.eligibility}</p>
                  </section>
                )}
                {scheme.process && (
                  <section>
                    <h4 className="text-sm font-medium mb-1">Process / Workflow</h4>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{scheme.process}</p>
                  </section>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {scheme.benefits && (
                  <section>
                    <h4 className="text-sm font-medium mb-1">Benefits / Risks</h4>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{scheme.benefits}</p>
                  </section>
                )}
                {scheme.deadlines && (
                  <section>
                    <h4 className="text-sm font-medium mb-1">Key Dates / Deadlines</h4>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{scheme.deadlines}</p>
                  </section>
                )}
              </div>

              {scheme.references?.length ? (
                <section>
                  <h4 className="text-sm font-medium mb-1">References</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {scheme.references.map((r, i) => (
                      <li key={i}>
                        {r.url ? (
                          <a className="underline" href={r.url} target="_blank" rel="noreferrer">
                            {r.label || `Reference ${i + 1}`}
                          </a>
                        ) : (
                          r.label || `Reference ${i + 1}`
                        )}
                        {r.filename && <span className="text-gray-600"> — {r.filename}</span>}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <div className="flex gap-2">
                <Link href={`/schemes?open=${encodeURIComponent(scheme.code)}`} className="text-xs underline">
                  Copy link to this scheme
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
