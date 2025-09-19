"use client";

import { useId, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAccentColor } from "@/src/lib/ui/colors";

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
  const accent = getAccentColor(scheme.category);
  const [measuredOpen, setMeasuredOpen] = useState(isOpen);

  // keep URL ?open= in sync
  useEffect(() => {
    const usp = new URLSearchParams(window.location.search);
    if (isOpen) usp.set("open", scheme.code);
    else usp.delete("open");
    const url = `${window.location.pathname}${usp.toString() ? `?${usp.toString()}` : ""}`;
    window.history.replaceState(null, "", url);
  }, [isOpen, scheme.code]);

  // height animation: wait until open to mount content
  useEffect(() => {
    if (isOpen) setMeasuredOpen(true);
  }, [isOpen]);

  const tagSlice = useMemo(() => (scheme.tags || []).slice(0, 3), [scheme.tags]);

  return (
    <div
      className="rounded-2xl border-2 p-4 bg-[color:var(--glass)] backdrop-blur transition-all duration-200 hover:-translate-y-[1px]"
      style={{ borderColor: accent, boxShadow: isOpen ? `0 0 24px -6px ${accent}` : "none" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[color:var(--text-1)] truncate" title={scheme.title}>
              {scheme.title}
            </h3>
            <span
              className="text-[10px] px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${scheme.mandatory ? "var(--danger)" : "var(--success)"}20`,
                color: scheme.mandatory ? "var(--danger)" : "var(--success)",
                border: `1px solid ${scheme.mandatory ? "#ff6b6b55" : "#32d58355"}`
              }}
            >
              {scheme.mandatory ? "Mandatory" : "Voluntary"}
            </span>
          </div>
          <div className="text-xs text-[color:var(--text-2)] truncate">{scheme.issuingAuthority || "—"}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {tagSlice.map((t) => (
              <span key={t} className="text-[11px] px-2 py-0.5 rounded-full border"
                style={{ backgroundColor: "var(--chip)", borderColor: "var(--chip-border)", color: "var(--text-2)" }}>
                #{t}
              </span>
            ))}
            {(scheme.tags?.length || 0) > tagSlice.length ? (
              <span className="text-[11px] text-[color:var(--text-2)]">+{(scheme.tags?.length || 0) - tagSlice.length}</span>
            ) : null}
          </div>
        </div>

        <button
          aria-expanded={isOpen}
          aria-controls={regionId}
          onClick={() => onToggle(!isOpen)}
          className="text-sm px-3 py-2 rounded-lg border transition-colors hover:bg-white/10"
          style={{ borderColor: "var(--border-1)", color: "var(--text-1)" }}
        >
          <span className="inline-flex items-center gap-1">
            Details
            <svg className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"/>
            </svg>
          </span>
        </button>
      </div>

      {/* Animated details */}
      <div
        id={regionId}
        role="region"
        aria-label={`${scheme.title} details`}
        className="grid transition-all duration-200 ease-out overflow-hidden"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
        onTransitionEnd={() => { if (!isOpen) setMeasuredOpen(false); }}
      >
        <div className="min-h-0 opacity-100" style={{ opacity: isOpen ? 1 : 0 }}>
          {measuredOpen && (
            <div className="mt-3 grid gap-4 text-[color:var(--text-2)]">
              {scheme.description && (
                <section>
                  <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                    <span className="inline-block h-3 w-1 rounded" style={{ backgroundColor: accent }} />
                    Overview
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">{scheme.description}</p>
                </section>
              )}

              {scheme.features?.length ? (
                <section>
                  <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                    <span className="inline-block h-3 w-1 rounded" style={{ backgroundColor: accent }} />
                    Key Features / Obligations
                  </h4>
                  <ul className="list-disc pl-5 text-sm space-y-1" style={{ "--tw-prose-bullets": accent } as any}>
                    {scheme.features.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                </section>
              ) : null}

              <div className="grid md:grid-cols-2 gap-4">
                {scheme.eligibility && (
                  <section>
                    <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                      <span className="inline-block h-3 w-1 rounded" style={{ backgroundColor: accent }} />
                      Eligibility / Applicability
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">{scheme.eligibility}</p>
                  </section>
                )}
                {scheme.process && (
                  <section>
                    <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                      <span className="inline-block h-3 w-1 rounded" style={{ backgroundColor: accent }} />
                      Process / Workflow
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">{scheme.process}</p>
                  </section>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {scheme.benefits && (
                  <section>
                    <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                      <span className="inline-block h-3 w-1 rounded" style={{ backgroundColor: accent }} />
                      Benefits / Risks
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">{scheme.benefits}</p>
                  </section>
                )}
                {scheme.deadlines && (
                  <section>
                    <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                      <span className="inline-block h-3 w-1 rounded" style={{ backgroundColor: accent }} />
                      Key Dates / Deadlines
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">{scheme.deadlines}</p>
                  </section>
                )}
              </div>

              {scheme.references?.length ? (
                <section>
                  <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                    <span className="inline-block h-3 w-1 rounded" style={{ backgroundColor: accent }} />
                    References
                  </h4>
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
                        {r.filename && <span className="opacity-80"> — {r.filename}</span>}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
