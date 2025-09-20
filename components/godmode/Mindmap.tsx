"use client";

import React, {
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import dynamic from "next/dynamic";
import {
  forceManyBody,
  forceCollide,
  forceX,
  forceY,
} from "d3-force";

const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d").then((m) => m.default),
  { ssr: false }
);

type Scheme = {
  id: string;
  title: string;
  category: string;
  tags: string[] | null;
  mandatory: boolean;
};

type Relation = {
  fromId: string;
  toId: string;
  type: "REQUIRES" | "ALIGNS_WITH" | "CONFLICTS_WITH";
  note?: string | null;
};

type Props = {
  schemes: Scheme[];
  relations?: Relation[];
};

const REL_STYLE = {
  REQUIRES: { color: "#ffd166", dash: [] as number[], width: 2.2 },
  ALIGNS_WITH: { color: "#6ee7b7", dash: [6, 4] as number[], width: 1.6 },
  CONFLICTS_WITH: { color: "#fb7185", dash: [3, 3] as number[], width: 2.2 },
};

const PANEL_W = 380;

function catColor(category: string) {
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

export default function Mindmap({ schemes, relations = [] }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);

  const [w, setW] = useState(1200);
  const [h, setH] = useState(640);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [cluster, setCluster] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [showEdges, setShowEdges] = useState(true);

  const [q, setQ] = useState("");
  const qNorm = q.trim().toLowerCase();

  // Track container size
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setW(Math.max(640, e.contentRect.width));
        setH(Math.max(520, e.contentRect.height));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cats = useMemo(
    () => Array.from(new Set(schemes.map((s) => s.category))).sort(),
    [schemes]
  );

  const graph = useMemo(() => {
    const nodes = schemes.map((s) => ({
      id: s.id,
      name: s.title,
      category: s.category,
      mandatory: s.mandatory,
      tags: (s.tags || []).map((t) => t.toLowerCase()),
    }));

    const links: Array<{
      source: string;
      target: string;
      type?: Relation["type"];
      why?: string[];
    }> = [];

    // explicit relations from DB
    for (const r of relations) {
      links.push({ source: r.fromId, target: r.toId, type: r.type });
    }

    // lightweight similarity links across categories (shared tags)
    const exists = new Set(links.map((l) => `${l.source}->${l.target}`));
    for (let i = 0; i < schemes.length; i++) {
      for (let j = i + 1; j < schemes.length; j++) {
        const a = schemes[i];
        const b = schemes[j];
        const ta = (a.tags || []).map((t) => t.toLowerCase());
        const tb = (b.tags || []).map((t) => t.toLowerCase());
        if (!ta.length || !tb.length) continue;
        const overlap = ta.filter((t) => tb.includes(t));
        if (overlap.length && a.category !== b.category) {
          const k1 = `${a.id}->${b.id}`;
          const k2 = `${b.id}->${a.id}`;
          if (!exists.has(k1) && !exists.has(k2)) {
            links.push({ source: a.id, target: b.id, why: overlap.slice(0, 3) });
          }
        }
      }
    }

    const degree: Record<string, number> = {};
    nodes.forEach((n) => (degree[n.id] = 0));
    links.forEach((l) => {
      degree[l.source] = (degree[l.source] ?? 0) + 1;
      degree[l.target] = (degree[l.target] ?? 0) + 1;
    });

    return { nodes, links, degree };
  }, [schemes, relations]);

  // Fit to view once data mounts or size changes
  useEffect(() => {
    const t = setTimeout(() => fgRef.current?.zoomToFit(120, 800), 250);
    return () => clearTimeout(t);
  }, [w, h, schemes.length, relations.length]);

  // D3 forces
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;

    const linkForce = fg.d3Force("link");
    linkForce?.distance((l: any) => (l.type ? 110 : 150));
    linkForce?.strength(0.9);

    fg.d3Force("charge", forceManyBody().strength(-220));
    fg.d3Force("collide", forceCollide(12));

    if (cluster) {
      const cols = Math.max(1, cats.length);
      const canvasW = selectedId ? Math.max(420, w - (PANEL_W + 16)) : w;
      const gutter = 24;
      const usable = canvasW - gutter * 2;
      const step = cols > 1 ? usable / (cols - 1) : 0;

      fg.d3Force(
        "forceX",
        forceX((n: any) => {
          const idx = Math.max(0, cats.indexOf(n.category));
          return gutter + idx * step;
        }).strength(0.08)
      );
      fg.d3Force("forceY", forceY(h / 2).strength(0.05));
    } else {
      fg.d3Force("forceX", null);
      fg.d3Force("forceY", null);
    }

    fg.d3Alpha(0.9);
    fg.d3AlphaDecay(0.02);
    fg.refresh();
  }, [cluster, cats, w, h, selectedId]);

  // Search list
  const results = useMemo(() => {
    if (!qNorm) return [];
    return schemes
      .map((s) => ({
        id: s.id,
        title: s.title,
        category: s.category,
        score: s.title.toLowerCase().includes(qNorm) ? 0 : 1,
      }))
      .filter((x) => x.title.toLowerCase().includes(qNorm))
      .sort((a, b) =>
        a.score === b.score
          ? a.title.localeCompare(b.title)
          : a.score - b.score
      )
      .slice(0, 12);
  }, [qNorm, schemes]);

  // Highlight sets
  const [hNodes, setHNodes] = useState<Set<string>>(new Set());
  const [hLinks, setHLinks] = useState<Set<any>>(new Set());

  const computeNeighbors = useCallback(
    (id: string) => {
      const ns = new Set<string>();
      const ls = new Set<any>();
      (graph.links as any[]).forEach((l) => {
        const s = typeof l.source === "object" ? l.source.id : l.source;
        const t = typeof l.target === "object" ? l.target.id : l.target;
        if (s === id || t === id) {
          ns.add(s);
          ns.add(t);
          ls.add(l);
        }
      });
      ns.add(id);
      return { ns, ls };
    },
    [graph.links]
  );

  const focus = useCallback(
    (id: string) => {
      const node = (fgRef.current?.graphData()?.nodes as any[])?.find(
        (n) => n.id === id
      );
      if (!node) return;
      setSelectedId(id);
      const { ns, ls } = computeNeighbors(id);
      setHNodes(ns);
      setHLinks(ls);
      if (typeof node.x === "number" && typeof node.y === "number") {
        fgRef.current?.centerAt(node.x, node.y, 600);
        fgRef.current?.zoom(2.2, 600);
      }
    },
    [computeNeighbors]
  );

  const onNodeClick = useCallback((n: any) => focus(n.id), [focus]);
  const onNodeHover = useCallback((n: any | null) => setHoverId(n?.id ?? null), []);
  const onBgClick = useCallback(() => {
    setSelectedId(null);
    setHoverId(null);
    setHNodes(new Set());
    setHLinks(new Set());
    fgRef.current?.zoomToFit(140, 600);
  }, []);

  // Node drawing
  const nodeDraw = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, scale: number) => {
      const id = node.id as string;
      const hot =
        hNodes.has(id) ||
        id === selectedId ||
        (hoverId && (id === hoverId || hNodes.has(hoverId)));
      const color = catColor(node.category as string);
      const degree = (graph as any).degree?.[id] ?? 0;
      const r = Math.min(12, 6 + Math.sqrt(degree));

      ctx.beginPath();
      ctx.arc(node.x, node.y, hot ? r + 2 : r, 0, 2 * Math.PI);
      ctx.fillStyle = hot ? color : "rgba(255,255,255,0.22)";
      ctx.fill();
      ctx.lineWidth = hot ? 2 : 1;
      ctx.strokeStyle = color;
      ctx.stroke();

      const show =
        showLabels || hot || scale > 1.35 || (degree >= 3 && scale > 1.1);
      if (show) {
        const label = node.name as string;
        const max = scale > 2.4 ? 56 : scale > 1.8 ? 44 : scale > 1.3 ? 32 : 26;
        const text = label.length > max ? label.slice(0, max - 1) + "…" : label;
        const fs = Math.max(10, 12 / scale);
        ctx.font = `${fs}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(230,235,255,0.95)";
        ctx.fillText(text, node.x + r + 6, node.y);
      }
    },
    [hNodes, selectedId, hoverId, showLabels, graph]
  );

  // Link drawing (quadratic, colored by relation type)
  const linkDraw = useCallback(
    (l: any, ctx: CanvasRenderingContext2D) => {
      if (!showEdges) return;
      const s = l.source;
      const t = l.target;
      if (typeof s.x !== "number" || typeof s.y !== "number") return;
      if (typeof t.x !== "number" || typeof t.y !== "number") return;

      const style =
        l.type && REL_STYLE[l.type as keyof typeof REL_STYLE]
          ? REL_STYLE[l.type as keyof typeof REL_STYLE]
          : { color: "rgba(255,255,255,0.20)", dash: [] as number[], width: 1 };

      const cx = (s.x + t.x) / 2;
      const cy = (s.y + t.y) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.setLineDash(style.dash);
      ctx.moveTo(s.x, s.y);
      ctx.quadraticCurveTo(cx, cy, t.x, t.y);
      ctx.lineWidth = hLinks.has(l) ? style.width + 1 : style.width;
      ctx.strokeStyle = style.color;
      ctx.stroke();
      ctx.restore();
    },
    [hLinks, showEdges]
  );

  // Side panel data
  const selected = selectedId
    ? schemes.find((s) => s.id === selectedId) || null
    : null;

  const neighbors = useMemo(() => {
    if (!selectedId) return [];
    const items: Array<{
      id: string;
      title: string;
      category: string;
      tags: string[];
      why: string[];
      type?: Relation["type"];
    }> = [];
    (graph.links as any[]).forEach((l) => {
      const s = typeof l.source === "object" ? l.source.id : l.source;
      const t = typeof l.target === "object" ? l.target.id : l.target;
      if (s === selectedId || t === selectedId) {
        const other = s === selectedId ? t : s;
        const sch = schemes.find((x) => x.id === other);
        if (sch) {
          items.push({
            id: sch.id,
            title: sch.title,
            category: sch.category,
            tags: (sch.tags || []).slice(0, 6),
            why: (l.why || []).slice(0, 3),
            type: l.type,
          });
        }
      }
    });
    items.sort((a, b) =>
      a.category === b.category
        ? a.title.localeCompare(b.title)
        : a.category.localeCompare(b.category)
    );
    return items.slice(0, 18);
  }, [selectedId, graph.links, schemes]);

  const graphW = selected ? Math.max(420, w - (PANEL_W + 16)) : w;

  return (
    <div
      ref={wrapRef}
      className="relative w-full rounded-2xl border border-[var(--border-1)] bg-[var(--glass)] backdrop-blur p-3"
      style={{ minHeight: 560 }}
    >
      {/* Controls */}
      <div className="absolute z-20 left-3 top-3 flex flex-wrap gap-3">
        <button
          onClick={() => fgRef.current?.zoomToFit(140, 600)}
          className="px-3 py-1 rounded-lg border border-[var(--border-1)] bg-[var(--glass)] text-xs hover:shadow-glow"
        >
          Fit
        </button>
        <button
          onClick={() => {
            setSelectedId(null);
            setHoverId(null);
            setHNodes(new Set());
            setHLinks(new Set());
            fgRef.current?.zoom(1, 400);
            fgRef.current?.centerAt(0, 0, 400);
          }}
          className="px-3 py-1 rounded-lg border border-[var(--border-1)] bg-[var(--glass)] text-xs"
        >
          Reset
        </button>

        <label className="flex items-center gap-2 text-xs px-2 py-1 rounded-lg border border-[var(--border-1)] bg-[var(--glass)] cursor-pointer">
          <input
            type="checkbox"
            checked={cluster}
            onChange={(e) => setCluster(e.target.checked)}
          />
          Cluster by Category
        </label>

        <label className="flex items-center gap-2 text-xs px-2 py-1 rounded-lg border border-[var(--border-1)] bg-[var(--glass)] cursor-pointer">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
          />
          Show All Labels
        </label>

        <label className="flex items-center gap-2 text-xs px-2 py-1 rounded-lg border border-[var(--border-1)] bg-[var(--glass)] cursor-pointer">
          <input
            type="checkbox"
            checked={showEdges}
            onChange={(e) => setShowEdges(e.target.checked)}
          />
          Show Edges
        </label>
      </div>

      {/* Search */}
      <div className="absolute z-20 right-3 top-3 w-80">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search schemes…"
          className="w-full px-3 py-2 rounded-lg border border-[var(--border-1)] bg-[var(--glass)] text-sm outline-none focus:ring-2 focus:ring-[var(--focus)]"
        />
        {qNorm && results.length > 0 && (
          <div className="mt-2 max-h-64 overflow-auto rounded-lg border border-[var(--border-1)] bg-[var(--glass)]">
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setQ("");
                  focus(r.id);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-white/10"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: catColor(r.category) }}
                  />
                  <span className="text-[var(--text-1)]">{r.title}</span>
                </div>
                <div className="text-xs text-[var(--text-2)]">{r.category}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Graph */}
      <div
        className="transition-[width] duration-300 ease-out"
        style={{ width: graphW, height: h }}
      >
        <ForceGraph2D
          ref={fgRef}
          width={graphW}
          height={h}
          graphData={graph}
          backgroundColor="transparent"
          cooldownTicks={90}
          enableZoomInteraction
          enablePanInteraction
          onBackgroundClick={onBgClick}
          onNodeClick={onNodeClick}
          onNodeHover={onNodeHover}
          nodeRelSize={6}
          nodeCanvasObject={nodeDraw}
          linkCanvasObjectMode={() => "after"}
          linkCanvasObject={linkDraw}
        />
      </div>

      {/* Right panel */}
      {selected && (
        <aside
          className="absolute z-30 top-0 right-0 h-full border-l border-[var(--border-1)] bg-[var(--glass)] backdrop-blur p-4 overflow-y-auto"
          style={{ width: PANEL_W }}
          role="region"
          aria-live="polite"
        >
          <div className="text-xs uppercase tracking-wide text-[var(--text-2)]">
            {selected.category}
          </div>
          <h3
            className="text-xl font-semibold text-[var(--text-1)] mt-1"
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

          <div className="mt-4">
            <div className="text-sm font-semibold mb-2">Linked Items</div>
            {neighbors.length === 0 ? (
              <div className="text-xs text-[var(--text-2)]">
                No links (explicit or shared tags).
              </div>
            ) : (
              <ul className="space-y-2">
                {neighbors.map((n) => (
                  <li
                    key={n.id}
                    className="rounded-lg p-2 border"
                    style={{
                      backgroundColor: "var(--chip)",
                      borderColor: "var(--chip-border)",
                    }}
                  >
                    <button
                      onClick={() => focus(n.id)}
                      className="text-left w-full"
                    >
                      <div className="text-xs text-[var(--text-2)]">
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
                          style={{ backgroundColor: catColor(n.category) }}
                        />
                        <span className="font-medium text-[var(--text-1)]">
                          {n.title.length > 60
                            ? n.title.slice(0, 59) + "…"
                            : n.title}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-[var(--text-2)]">
                        {n.type ? (
                          <>
                            relation:{" "}
                            <span className="opacity-90">
                              {n.type.replace("_", " ").toLowerCase()}
                            </span>
                          </>
                        ) : n.why.length ? (
                          <>
                            shares tags:{" "}
                            <span className="opacity-90">
                              {n.why.join(", ")}
                            </span>
                          </>
                        ) : (
                          <span className="opacity-75">
                            related by similarity
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <a
            href={`/schemes?q=${encodeURIComponent(selected.title)}`}
            className="inline-block mt-4 px-3 py-1 rounded-lg border border-[var(--border-1)] bg-[var(--glass)] text-sm hover:shadow-glow"
          >
            View in Repository
          </a>

          <button
            onClick={() => onBgClick()}
            className="mt-3 block px-3 py-1 rounded-lg border border-[var(--border-1)] bg-[var(--glass)] text-sm"
          >
            Close
          </button>
        </aside>
      )}
    </div>
  );
}
