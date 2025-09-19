"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ExpandableCard from "./ExpandableCard";
import FilterPanel from "./FilterPanel";

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
  const catParam = params.getAll("category");
  const tagParam = params.getAll("tag");
  const mandatoryParam = params.get("mandatory");
  const openParam = params.get("open") ?? "";

  const [q, setQ] = useState(qParam);
  const [activeCats, setActiveCats] = useState<string[]>(catParam);
  const [activeTags, setActiveTags] = useState<string[]>(tagParam);
  const [mandatory, setMandatory] = useState<"all" | "true" | "false">(
    mandatoryParam === "true" ? "true" : mandatoryParam === "false" ? "false" : "all"
  );
  const [open, setOpen] = useState(openParam);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const usp = new URLSearchParams();
      if (q) usp.set("q", q);
      activeCats.forEach((c) => usp.append("category", c));
      activeTags.forEach((t) => usp.append("tag", t));
      if (mandatory !== "all") usp.set("mandatory", mandatory);
      if (open) usp.set("open", open);
      router.replace(`/schemes${usp.toString() ? `?${usp.toString()}` : ""}`, { scroll: false });
    }, 200);
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
  }, []);

  return (
    <div className="relative z-10">
      {/* Sticky glass bar */}
      <div className="sticky top-0 z-20 border-b border-[color:var(--border-1)] bg-[color:var(--bg-0)]/65 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <input
              aria-label="Search schemes"
              placeholder="Search by title, code, authority, tags…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-lg px-3 py-2 bg-[color:var(--glass)] border border-[color:var(--border-1)] text-[color:var(--text-1)] placeholder-[color:var(--text-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--focus)]"
            />
          </div>
          <select
            aria-label="Mandatory filter"
            value={mandatory}
            onChange={(e) => setMandatory(e.target.value as any)}
            className="hidden sm:block rounded-lg px-3 py-2 bg-[color:var(--glass)] border border-[color:var(--border-1)] text-[color:var(--text-1)] focus:outline-none focus:ring-2 focus:ring-[color:var(--focus)]"
          >
            <option value="all">All</option>
            <option value="true">Mandatory</option>
            <option value="false">Voluntary</option>
          </select>
          <button
            onClick={() => setDrawerOpen(true)}
            className="sm:hidden px-3 py-2 rounded-lg bg-[color:var(--glass)] border border-[color:var(--border-1)]"
            aria-label="Open filters"
          >
            Filters
          </button>
          <button onClick={clearAll} className="hidden sm:block px-3 py-2 rounded-lg bg-[color:var(--glass)] border border-[color:var(--border-1)]">
            Clear all
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12 pt-6">
        {(activeCats.length || activeTags.length || mandatory !== "all" || q) ? (
          <div className="flex flex-wrap items-center gap-2 mb-4 text-[color:var(--text-2)]">
            <span className="text-sm">Active filters:</span>
            {q ? <span className="text-xs px-2 py-1 rounded-full bg-[color:var(--chip)] border border-[color:var(--chip-border)]">q: “{q}”</span> : null}
            {mandatory !== "all" ? (
              <span className="text-xs px-2 py-1 rounded-full bg-[color:var(--chip)] border border-[color:var(--chip-border)]">
                {mandatory === "true" ? "mandatory" : "voluntary"}
              </span>
            ) : null}
            {activeCats.map((c) => (
              <button key={c} onClick={() => toggleCat(c)} className="text-xs px-2 py-1 rounded-full bg-[color:var(--chip)] border border-[color:var(--chip-border)]">
                {c} ×
              </button>
            ))}
            {activeTags.map((t) => (
              <button key={t} onClick={() => toggleTag(t)} className="text-xs px-2 py-1 rounded-full bg-[color:var(--chip)] border border-[color:var(--chip-border)]">
                #{t} ×
              </button>
            ))}
            <button onClick={clearAll} className="text-xs underline ml-2">Clear</button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
          <aside className="hidden md:block">
            <FilterPanel
              allCategories={allCategories}
              allTags={allTags}
              activeCats={activeCats}
              activeTags={activeTags}
              mandatory={mandatory}
              onToggleCat={toggleCat}
              onToggleTag={toggleTag}
              onMandatory={(v) => setMandatory(v)}
              onClear={clearAll}
            />
          </aside>

          <main className="space-y-8">
            {Object.keys(byCat).length === 0 ? (
              <div className="text-sm text-[color:var(--text-2)] border border-[color:var(--border-1)] rounded-xl p-6 bg-[color:var(--glass)]">
                No results match your filters.
              </div>
            ) : (
              Object.entries(byCat).map(([category, items]) => (
                <section key={category} className="space-y-4">
                  <h2 className="text-2xl font-semibold">{category}</h2>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {items.map((s) => (
                      <ExpandableCard
                        key={s.id}
                        scheme={{ ...s, references: parseRefs(s.references) }}
                        isOpen={open === s.code}
                        onToggle={(next) => setOpen(next ? s.code : "")}
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-[color:var(--bg-1)] border-l border-[color:var(--border-1)] shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium">Filters</h3>
              <button onClick={() => setDrawerOpen(false)} className="text-sm underline">Close</button>
            </div>
            <FilterPanel
              allCategories={allCategories}
              allTags={allTags}
              activeCats={activeCats}
              activeTags={activeTags}
              mandatory={mandatory}
              onToggleCat={toggleCat}
              onToggleTag={toggleTag}
              onMandatory={(v) => setMandatory(v)}
              onClear={clearAll}
            />
          </div>
        </div>
      )}
    </div>
  );
}
