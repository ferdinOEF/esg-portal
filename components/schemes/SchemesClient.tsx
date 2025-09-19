"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ExpandableCard from "./ExpandableCard";

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
  references?: unknown;
};

function groupBy<T, K extends string>(arr: T[], key: (t: T) => K) {
  return arr.reduce((acc, item) => {
    const k = key(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

function parseRefs(refs: unknown): RefItem[] {
  if (!refs) return [];
  if (Array.isArray(refs)) {
    return refs
      .map((r) => (typeof r === "object" && r ? r : null))
      .filter(Boolean) as RefItem[];
  }
  return [];
}

export default function SchemesClient({ initialSchemes }: { initialSchemes: Scheme[] }) {
  const params = useSearchParams();
  const router = useRouter();

  const qParam = params.get("q") ?? "";
  const catParam = params.getAll("category"); // allow multi
  const tagParam = params.getAll("tag");
  const mandatoryParam = params.get("mandatory"); // "true" | "false" | null
  const openParam = params.get("open") ?? "";

  const [q, setQ] = useState(qParam);
  const [activeCats, setActiveCats] = useState<string[]>(catParam);
  const [activeTags, setActiveTags] = useState<string[]>(tagParam);
  const [mandatory, setMandatory] = useState<"all" | "true" | "false">(mandatoryParam === "true" ? "true" : mandatoryParam === "false" ? "false" : "all");
  const [open, setOpen] = useState(openParam);

  // Sync URL when filters change (debounced for q)
  useEffect(() => {
    const t = setTimeout(() => {
      const usp = new URLSearchParams();
      if (q) usp.set("q", q);
      activeCats.forEach((c) => usp.append("category", c));
      activeTags.forEach((t) => usp.append("tag", t));
      if (mandatory !== "all") usp.set("mandatory", mandatory);
      if (open) usp.set("open", open);
      router.replace(`/schemes${usp.toString() ? `?${usp.toString()}` : ""}`, { scroll: false });
    }, 250);
    return () => clearTimeout(t);
  }, [q, activeCats, activeTags, mandatory, open, router]);

  const allCategories = useMemo(
    () => Array.from(new Set(initialSchemes.map((s) => s.category))).sort(),
    [initialSchemes]
  );
  const allTags = useMemo(
    () => Array.from(new Set(initialSchemes.flatMap((s) => s.tags || []))).sort(),
    [initialSchemes]
  );

  const filtered = useMemo(() => {
    const qLower = q.toLowerCase();
    return initialSchemes.filter((s) => {
      const qMatch =
        !qLower ||
        s.title.toLowerCase().includes(qLower) ||
        s.code.toLowerCase().includes(qLower) ||
        (s.description || "").toLowerCase().includes(qLower) ||
        s.category.toLowerCase().includes(qLower) ||
        (s.issuingAuthority || "").toLowerCase().includes(qLower) ||
        (s.tags || []).some((t) => t.toLowerCase().includes(qLower));
      const catMatch = activeCats.length === 0 || activeCats.includes(s.category);
      const tagMatch = activeTags.length === 0 || (s.tags || []).some((t) => activeTags.includes(t));
      const manMatch =
        mandatory === "all" ||
        (mandatory === "true" && s.mandatory) ||
        (mandatory === "false" && !s.mandatory);
      return qMatch && catMatch && tagMatch && manMatch;
    });
  }, [initialSchemes, q, activeCats, activeTags, mandatory]);

  const byCat = useMemo(() => groupBy(filtered, (s) => s.category), [filtered]);

  function toggleCat(c: string) {
    setActiveCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }
  function toggleTag(t: string) {
    setActiveTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }
  function clearAll() {
    setQ("");
    setActiveCats([]);
    setActiveTags([]);
    setMandatory("all");
    setOpen("");
  }

  useEffect(() => {
    if (openParam) setOpen(openParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // set initial open once

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Schemes • Certifications • Frameworks</h1>
          <p className="text-sm text-gray-600">Browse everything in one place. Filter, search, and expand to read details.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={clearAll} className="text-sm px-3 py-2 rounded border hover:bg-gray-50">Clear all</button>
        </div>
      </header>

      {/* Filters */}
      <section className="rounded-2xl border bg-white p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            aria-label="Search schemes"
            placeholder="Search by title, code, authority, tags..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
          <select
            aria-label="Mandatory filter"
            value={mandatory}
            onChange={(e) => setMandatory(e.target.value as any)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All</option>
            <option value="true">Mandatory</option>
            <option value="false">Voluntary</option>
          </select>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {allCategories.map((c) => {
            const active = activeCats.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggleCat(c)}
                className={`text-xs px-2 py-1 rounded-full border ${active ? "bg-black text-white" : "bg-white hover:bg-gray-50"}`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {allTags.map((t) => {
            const active = activeTags.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={`text-xs px-2 py-1 rounded-full border ${active ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50"}`}
              >
                #{t}
              </button>
            );
          })}
        </div>
      </section>

      {/* Results */}
      {Object.keys(byCat).length === 0 ? (
        <div className="text-sm text-gray-600">No results match your filters.</div>
      ) : (
        Object.entries(byCat).map(([category, items]) => (
          <section key={category} className="space-y-3">
            <h2 className="text-lg font-medium">{category}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((s) => (
                <ExpandableCard
                  key={s.id}
                  scheme={{
                    ...s,
                    references: parseRefs(s.references),
                  }}
                  isOpen={open === s.code}
                  onToggle={(openNow) => setOpen(openNow ? s.code : "")}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
