// components/godmode/Mindmap.tsx
"use client";

import * as React from "react";

type Scheme = {
  id: string;
  title: string;
  category: string;
  tags: string[] | null;
  mandatory: boolean;
  issuingAuthority?: string | null;
  description?: string | null;
  features?: string[] | null;
};

type Props = {
  schemes: Scheme[];
};

const RING_RADIUS = 220;    // distance of category hubs from center
const NODE_ORBIT = 70;      // scheme orbit radius around each category hub
const SVG_W = 1000;
const SVG_H = 560;

// Utility: deterministic pseudo-random (stable positions across renders)
function seededRand(seed: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (min: number, max: number) => {
    h = (h + 0x6D2B79F5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    const n = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return min + (max - min) * n;
  };
}

function getCategoryColor(category: string) {
  const map: Record<string, string> = {
    "Regulatory Frameworks (India)": "#ffb020",
    "EPR & Waste (India)": "#7dd87d",
    "Product Compliance (India)": "#e879f9",
    "Goa Environmental": "#5eead4",
    "Coastal/CRZ (Goa)": "#fb7185",
    "Trade & Carbon (EU)": "#60a5fa",
    "Due Diligence (EU)": "#f59e0b",
    "EEE Compliance (EU)": "#a78bfa",
    "Disclosure (Global)": "#34d399",
    "Management Systems (ISO)": "#f472b6",
    "Carbon Accounting (Global)": "#38bdf8",
    "Carbon Targets (Global)": "#22d3ee",
    "Enablement/Certification (India)": "#fbbf24",
  };
  return map[category] ?? "#8b9bff";
}

export default function Mindmap({ schemes }: Props) {
  const center = { x: SVG_W / 2, y: SVG_H / 2 };

  // Normalize tags
  const normalized = schemes.map(s => ({
    ...s,
    tags: (s.tags || []).map(t => t.toLowerCase()),
  }));

  // Group by category
  const byCategory = new Map<string, Scheme[]>();
  for (const s of normalized) {
    const key = s.category ?? "Uncategorized";
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(s);
  }
  const categories = Array.from(byCategory.keys()).sort();

  // Place categories evenly on a circle
  const catPositions = new Map<string, { x: number; y: number; angle: number }>();
  categories.forEach((cat, i) => {
    const angle = (i / categories.length) * Math.PI * 2 - Math.PI / 2; // start at top
    const x = center.x + Math.cos(angle) * RING_RADIUS;
    const y = center.y + Math.sin(angle) * RING_RADIUS;
    catPositions.set(cat, { x, y, angle });
  });

  // Place schemes around their category hub on a local orbit
  const nodePositions = new Map<string, { x: number; y: number }>();
  for (const [cat, list] of byCategory.entries()) {
    const hub = catPositions.get(cat)!;
    const rand = seededRand(cat);
    list.forEach((s, idx) => {
      const theta = (idx / list.length) * Math.PI * 2 + rand(0, 0.8);
      const r = NODE_ORBIT + rand(-16, 16);
      const x = hub.x + Math.cos(theta) * r;
      const y = hub.y + Math.sin(theta) * r;
      nodePositions.set(s.id, { x, y });
    });
  }

  // Build light relationship edges: schemes that share at least 1 tag (cap per node)
  const edges: Array<{ a: Scheme; b: Scheme }> = [];
  const perNodeLimit = 2;
  for (const [cat, list] of byCategory.entries()) {
    // Only connect across different categories to keep it informative
    for (const s of list) {
      let added = 0;
      for (const other of normalized) {
        if (added >= perNodeLimit) break;
        if (other.id === s.id) continue;
        if ((other.tags || []).length === 0 || (s.tags || []).length === 0) continue;

        const overlap = s.tags!.some(t => other.tags!.includes(t));
        const differentCat = (other.category ?? "") !== (s.category ?? "");
        if (overlap && differentCat) {
          edges.push({ a: s, b: other });
          added++;
        }
      }
    }
  }

  // Interaction state
  const [hoverId, setHoverId] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<Scheme | null>(null);

  return (
    <div className="relative">
      {/* Canvas */}
      <svg
        width="100%"
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="rounded-2xl border border-[color:var(--border-1)] bg-[var(--glass)] backdrop-blur"
      >
        {/* Subtle center glow */}
        <defs>
          <radialGradient id="g" cx="50%" cy="45%">
            <stop offset="0%" stopColor="white" stopOpacity="0.06" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="url(#g)" />

        {/* Relationship edges */}
        <g stroke="white" opacity={0.12}>
          {edges.map((e, i) => {
            const p1 = nodePositions.get(e.a.id)!;
            const p2 = nodePositions.get(e.b.id)!;
            const isHot =
              hoverId === e.a.id || hoverId === e.b.id || selected?.id === e.a.id || selected?.id === e.b.id;
            return (
              <line
                key={i}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={isHot ? getCategoryColor(e.a.category) : "white"}
                opacity={isHot ? 0.35 : 0.12}
                strokeWidth={isHot ? 1.8 : 1}
              />
            );
          })}
        </g>

        {/* Category hubs */}
        <g>
          {categories.map((cat) => {
            const hub = catPositions.get(cat)!;
            const col = getCategoryColor(cat);
            return (
              <g key={cat}>
                <circle
                  cx={hub.x}
                  cy={hub.y}
                  r={20}
                  fill="var(--glass)"
                  stroke={col}
                  strokeWidth={2}
                  style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.08))" }}
                />
                <text
                  x={hub.x}
                  y={hub.y - 26}
                  textAnchor="middle"
                  className="text-[10px] fill-[color:var(--text-2)]"
                >
                  {cat}
                </text>
              </g>
            );
          })}
        </g>

        {/* Scheme nodes */}
        <g>
          {normalized.map((s) => {
            const p = nodePositions.get(s.id)!;
            const hot = hoverId === s.id || selected?.id === s.id;
            const col = getCategoryColor(s.category);
            return (
              <g
                key={s.id}
                onMouseEnter={() => setHoverId(s.id)}
                onMouseLeave={() => setHoverId((h) => (h === s.id ? null : h))}
                onClick={() => setSelected(s)}
                className="cursor-pointer"
              >
                {/* Glow */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hot ? 13 : 10}
                  fill="var(--glass)"
                  stroke={col}
                  strokeWidth={hot ? 2.5 : 2}
                  style={{
                    transition: "all 150ms ease",
                    filter: hot ? `drop-shadow(0 0 14px ${col}66)` : "none",
                  }}
                />
                {/* Title (truncated) */}
                <text
                  x={p.x + 14}
                  y={p.y + 4}
                  className="text-[11px] fill-[color:var(--text-1)]"
                >
                  {s.title.length > 34 ? s.title.slice(0, 31) + "…" : s.title}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Inline details panel */}
      {selected && (
        <div
          className="mt-3 rounded-xl border border-[color:var(--border-1)] bg-[var(--glass)] p-4"
          role="region"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-wide text-[color:var(--text-2)]">
                {selected.category}
              </div>
              <h3
                className="text-lg font-semibold text-[color:var(--text-1)]"
                style={{ textShadow: "0 0 12px rgba(122,162,255,0.25)" }}
              >
                {selected.title}
              </h3>
              <div className="mt-1 text-xs">
                <span
                  className={`px-2 py-0.5 rounded-full ${
                    selected.mandatory
                      ? "bg-[var(--danger)]/20 text-[var(--danger)]"
                      : "bg-[var(--success)]/20 text-[var(--success)]"
                  }`}
                >
                  {selected.mandatory ? "Mandatory" : "Voluntary"}
                </span>
              </div>
              {selected.issuingAuthority && (
                <div className="mt-2 text-sm text-[color:var(--text-2)]">
                  Issued by: {selected.issuingAuthority}
                </div>
              )}
              {selected.description && (
                <p className="mt-2 text-sm text-[color:var(--text-2)] line-clamp-4">
                  {selected.description}
                </p>
              )}
              {(selected.tags?.length ?? 0) > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {selected.tags!.slice(0, 8).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: "var(--chip)",
                        borderColor: "var(--chip-border)",
                        color: "var(--text-2)",
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              className="px-3 py-1 rounded-lg border border-[color:var(--border-1)] bg-[var(--glass)] text-sm hover:shadow-glow"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Top
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
