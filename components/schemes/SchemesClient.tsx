// components/schemes/SchemesClient.tsx
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

  // Read URL state
  const qParam = params.get("q") ?? "";
  const catParam = params.getAll("category");
  const tagParam = params.getAll("tag");
  const mandatoryParam = params.get("mandatory"); // "true" | "false" | null
  const openParam = params.get("open") ?? "";

  // Local state
  const [q, setQ] = useState(qParam);
  const [activeCats, setActiveCats] = useState<string[]>(catParam);
  const [activeTags, setActiveTags] = useState<string[]>(tagParam);
  const [mandatory, setMandatory] = useState<"all" | "true" | "false">(
    mandatoryParam === "true" ? "true" : mandatoryParam === "false" ? "false" : "all"
  );
  const [open, setOpen] = useState(openParam);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sync URL (debounced)
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

  // Derive facet options
  const allCategories = useMemo(
    () => Array.from(new Set(initialSchemes.map((s) => s.category))).sort(),
    [initialSchemes]
  );
  const allTags = useMemo(
    () => Array.from(new Set(initialSchemes.flatMap((s) => s.tags || []))).sort(),
    [initialSchemes]
  );

  // Filter logic
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

  // Actions
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
    <div className="space-y-4">
      {/* Sticky search + filter toggle */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <input
              aria-label="Search schemes"
              placeholder="Search by title, code, authority, tags…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <select
            aria-label="Mandatory filter"
            value={mandatory}
            onChange={(e) => setMandatory(e.target.value as any)}
            className="border rounded-lg px-3 py-2 hidden sm:block"
          >
            <option value="all">All</option>
            <option value="true">Mandatory</option>
            <option value="false">Voluntary</option>
          </select>
          <button
            onClick={() => setDrawerOpen(true)}
            className="sm:hidden px-3 py-2 border rounded-lg"
            aria-label="Open filters"
          >
            Filters
          </button>
          <button onClick={clearAll} className="px-3 py-2 border rounded-lg hidden sm:block">
            Clear all
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-10">
        {/* Active filters summary */}
        {(activeCats.length || activeTags.length || mandatory !== "all" || q) ? (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-sm text-gray-600">Active filters:</span>
            {q ? <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">q: “{q}”</span> : null}
            {mandatory !== "all" ? (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {mandatory === "true" ? "mandatory" : "voluntary"}
              </span>
            ) : null}
            {activeCats.map((c) => (
              <button
                key={c}
                onClick={() => toggleCat(c)}
                className="text-xs bg-gray-100 px-2 py-1 rounded-full"
              >
                {c} ×
              </button>
            ))}
            {activeTags.map((t) => (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className="text-xs bg-gray-100 px-2 py-1 rounded-full"
              >
                #{t} ×
              </button>
            ))}
            <button onClick={clearAll} className="text-xs underline ml-2">Clear</button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar filters (desktop) */}
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

          {/* Results */}
          <main className="space-y-6">
            {Object.keys(byCat).length === 0 ? (
              <div className="text-sm text-gray-600 border rounded-xl p-6 bg-white">
                No results match your filters.
              </div>
            ) : (
              Object.entries(byCat).map(([category, items]) => (
                <section key={category} className="space-y-3">
                  <h2 className="text-xl font-semibold">{category}</h2>
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
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-xl p-4 overflow-y-auto">
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
