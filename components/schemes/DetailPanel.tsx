// components/schemes/DetailPanel.tsx
"use client";

import { getAccentColor } from "@/src/lib/ui/colors";

type RefItem = { label?: string; url?: string; filename?: string };
export type SchemeForPanel = {
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
  references?: RefItem[];
};

export default function DetailPanel({
  scheme,
  onClose,
}: {
  scheme: SchemeForPanel;
  onClose: () => void;
}) {
  if (!scheme) return null;
  const accent = getAccentColor(scheme.category);

  return (
    <aside
      className="hidden xl:block"
      aria-label={`${scheme.title} details panel`}
    >
      <div
        className="ml-auto max-w-3xl rounded-2xl border p-6 bg-[color:var(--glass)] backdrop-blur"
        style={{
          borderColor: accent,
          boxShadow: `inset 0 0 48px -28px ${accent}, 0 0 32px -10px ${accent}`,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-[color:var(--text-1)]">{scheme.title}</h3>
            <p className="text-xs text-[color:var(--text-2)] mt-1">
              {scheme.issuingAuthority || "—"} · {scheme.category}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-sm px-3 py-2 rounded-lg border hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus)]"
            style={{ borderColor: "var(--border-1)" }}
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-5 text-[color:var(--text-2)]">
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
              <ul className="list-disc pl-5 text-sm space-y-1">
                {scheme.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </section>
          ) : null}

          <div className="grid md:grid-cols-2 gap-5">
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

          <div className="grid md:grid-cols-2 gap-5">
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
        </div>
      </div>
    </aside>
  );
}
