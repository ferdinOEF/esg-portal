// components/godmode/Mindmap.tsx
"use client";

import React, {
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useLayoutEffect,
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

const RELATION_STYLE = {
  REQUIRES: { color: "#ffd166", dash: [] as number[], width: 2.2 },
  ALIGNS_WITH: { color: "#6ee7b7", dash: [6, 4] as number[], width: 1.6 },
  CONFLICTS_WITH: { color: "#fb7185", dash: [3, 3] as number[], width: 2.2 },
};

const PANEL_W = 360;
const PANEL_GAP = 16;

export default function Mindmap({ schemes, relations = [] }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fgRef = useRef<any>(null);

  const [dims, setDims] = useState({ w: 1200, h: 600 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [clusterByCategory, setClusterByCategory] = useState(true);
  const [showAllLabels, setShowAllLabels] = useState(false);
  const [showEdges, setShowEdges] = useState(true);

  const [q, setQ] = useState("");
  const normalizedQ = q.trim().toLowerCase();

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setDims((d) => ({ ...d, w: e.contentRect.width }));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const categories = useMemo(
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

    for (const r of relations) {
      links.push({ source: r.fromId, target: r.toId, type: r.type });
    }

    const existing = new Set(links.map((l) => `${l.source}->${l.target}`));
    for (let i = 0; i < schemes.length; i++) {
      for (let j = i + 1; j < schemes.length; j++) {
        const a = schemes[i];
        const b = schemes[j];
        const ta = (a.tags || []).map((t) => t.toLowerCase());
        const tb = (b.tags || []).map((t) => t.toLowerCase());
        if (!ta.length || !tb.length) continue;
        const overlap = ta.filter((t) => tb.includes(t));
        if (overlap.length && a.category !== b.category) {
          const key1 = `${a.id}->${b.id}`;
          const key2 = `${b.id}->${a.id}`;
          if (!existing.has(key1) && !existing.has(key2)) {
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

  const searchResults = useMemo(() => {
    if (!normalizedQ) return [];
    return schemes
      .map((s) => ({
        id: s.id,
        title: s.title,
        category: s.category,
        score: s.title.toLowerCase().includes(normalizedQ) ? 0 : 1,
      }))
      .filter((x) => x.title.toLowerCase().includes(normalizedQ))
      .sort((a, b) => (a.score === b.score ? a.title.localeCompare(b.title) : a.score - b.score))
      .slice(0, 12);
  }, [normalizedQ, schemes]);

  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<any>>(new Set());

  const computeNeighbors = useCallback(
    (id: string) => {
      const n = new Set<string>();
      const el = new Set<any>();
      (graph.links as any[]).forEach((l) => {
        const src = typeof l.source === "object" ? l.source.id : l.source;
        const tgt = typeof l.target === "object" ? l.target.id : l.target;
        if (src === id || tgt === id) {
          n.add(src);
          n.add(tgt);
          el.add(l);
        }
      });
      n.add(id);
      return { n, el };
    },
    [graph.links]
  );

  const focusNodeById = useCallback(
    (id: string) => {
      const node = (fgRef.current?.graphData()?.nodes as any[])?.find((n) => n.id === id);
      if (!node) return;
      setSelectedId(id);
      const { n, el } = computeNeighbors(id);
      setHighlightNodes(n);
      setHighlightLinks(el);
      const t = 600;
      const zoom = 2;
      if (typeof node.x === "number" && typeof node.y === "number") {
        fgRef.current?.centerAt(node.x, node.y, t);
        fgRef.current?.zoom(zoom, t);
      }
    },
    [computeNeighbors]
  );

  const onNodeClick = useCallback((node: any) => focusNodeById(node.id), [focusNodeById]);
  const onNodeHover = useCallback((node: any | null) => setHoverId(node?.id ?? null), []);
  const onBackgroundClick = useCallback(() => {
    setSelectedId(null);
    setHoverId(null);
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    fgRef.current?.zoomToFit(160, 600);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => fgRef.current?.zoomToFit(160, 700), 350);
    return () => clearTimeout(id);
  }, [selectedId]);

  // Forces (use named imports with types)
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;

    const linkForce = fg.d3Force("link");
    linkForce?.distance((l: any) => (l.type ? 90 : 120));
    linkForce?.strength(0.9);

    fg.d3Force("charge", forceManyBody().strength(-180));
    fg.d3Force("collide", forceCollide(12));

    if (clusterByCategory) {
      const cols = Math.max(1, categories.length);
      fg.d3Force(
        "forceX",
        forceX((node: any) => {
          const idx = categories.indexOf(node.category) ?? 0;
          const canvasW =
            selectedId ? Math.max(360, dims.w - (PANEL_W + PANEL_GAP)) : dims.w;
          const gutter = 24;
          const usable = canvasW - gutter * 2;
          const step = usable / Math.max(1, cols - 1);
          return gutter + idx * step;
        }).strength(0.08)
      );
      fg.d3Force("forceY", forceY(dims.h / 2).strength(0.04));
    } else {
      fg.d3Force("forceX", null);
      fg.d3Force("forceY", null);
    }

    fg.d3AlphaDecay(0.02);
  }, [clusterByCategory, categories, dims.w, dims.h, selectedId]);

  const graphWidth = selectedId
    ? Math.max(360, dims.w - (PANEL_W + PANEL_GAP))
    : dims.w;

  const selectedScheme = selectedId
    ? schemes.find((s) => s.id === selectedId) || null
    : null;

  const neighborsList = useMemo(() => {
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
      const src = typeof l.source === "object" ? l.source.id : l.source;
      const tgt = typeof l.target === "object" ? l.target.id : l.target;
      if (src === selectedId || tgt === selectedId) {
        const other = src === selectedId ? tgt : src;
        const s = schemes.find((x) => x.id === other);
        if (s) {
          items.push({
            id: s.id,
            title: s.title,
            category: s.category,
            tags: (s.tags || []).slice(0, 6),
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
    return items.slice(0, 16);
  }, [selectedId, graph.links, schemes]);

  const drawNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const id = node.id as string;
      const hot =
        highlightNodes.has(id) ||
        id === selectedId ||
        (hoverId && (id === hoverId || highlightNodes.has(hoverId)));
      const col = getCategoryColor(node.category as string);

      const degree = (graph as any).degree?.[id] ?? 0;
      const r = Math.min(12, 6 + Math.sqrt(degree));

      ctx.beginPath();
      ctx.arc(node.x, node.y, hot ? r + 2 : r, 0, 2 * Math.PI, false);
      ctx.fillStyle = hot ? col : "rgba(255,255,255,0.22)";
      ctx.fill();
      ctx.lineWidth = hot ? 2 : 1;
      ctx.strokeStyle = col;
      ctx.stroke();

      const mustShow = showAllLabels || hot || globalScale > 1.3;
      if (mustShow) {
        const label = node.name as string;
        const maxChars = globalScale > 2.2 ? 48 : globalScale > 1.6 ? 36 : 28;
        const text = label.length > maxChars ? label.slice(0, maxChars - 1) + "…" : label;
        const fontSize = Math.max(10, 12 / globalScale);
        ctx.font = `${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(230,235,255,0.95)";
        ctx.fillText(text, node.x + r + 6, node.y);
      }
    },
    [highlightNodes, selectedId, hoverId, showAllLabels, graph]
  );

  const linkCanvasObject = useCallback(
    (link: any, ctx: CanvasRenderingContext2D) => {
      if (!showEdges) return;

      const src = link.source;
      const tgt = link.target;
      if (typeof src.x !== "number" || typeof src.y !== "number") return;
      if (typeof tgt.x !== "number" || typeof tgt.y !== "number") return;

      const st =
        link.type && RELATION_STYLE[link.type as keyof typeof RELATION_STYLE]
          ? RELATION_STYLE[link.type as keyof typeof RELATION_STYLE]
          : { color: "rgba(255,255,255,0.20)", dash: [] as number[], width: 1 };

      const cx = (src.x + tgt.x) / 2;
      const laneGap = 0.0; // keep subtle; lanes handled by forceX/forceY
      const cy = (src.y + tgt.y) / 2 + laneGap;

      ctx.save();
      ctx.beginPath();
      ctx.setLineDash(st.dash);
      ctx.moveTo(src.x, src.y);
      ctx.quadraticCurveTo(cx, cy, tgt.x, tgt.y);
      ctx.lineWidth = highlightLinks.has(link) ? st.width + 1 : st.width;
      ctx.strokeStyle = st.color;
      ctx.stroke();
      ctx.restore();
    },
    [highlightLinks, showEdges]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl border border-[var(--border-1)] bg-[var(--glass)] backdrop-blur"
      style={{ minHeight: 560 }}
    >
      {/* Controls */}
      <div className="absolute z-10 left-3 top-3 flex flex-wrap gap-3">
        <button
          onClick={() => fgRef.current?.zoomToFit(160, 600)}
          className="px-3 py-1 rounded-lg border border-[var(--border-1)] bg-[var(--glass)] text-xs hover:shadow-glow"
        >
          Fit
        </button>
        <button
          onClick={() => {
            setSelectedId(null);
            setHoverId(null);
            setHighlightNodes(new Set());
            setHighlightLinks(new Set());
            fgRef.current?.zoom(1, 400);
          }}
          className="px-3 py-1 rounded-lg border border-[var(--border-1)] bg-[var(--glass)] text-xs"
        >
          Reset
        </button>

        <label className="flex items-center gap-2 text-xs px-2 py-1 rounded-lg border border-[var(--border-1)] bg-[var(--glass)] cursor-pointer">
          <input
            type="checkbox"
            checked={clusterByCategory}
            onChange={(e) => setClusterByCategory(e.target.checked)}
          />
          Cluster by Category
        </label>

        <label className="flex items-center gap-2 text-xs px-2 py-1 rounded-lg border border-[var(--border-1)] bg-[var(--glass)] cursor-pointer">
          <input
            type="checkbox"
            checked={showAllLabels}
            onChange={(e) => setShowAllLabels(e.target.checked)}
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
      <div className="absolute z-10 right-3 top-3 w-72">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search schemes…"
          className="w-full px-3 py-2 rounded-lg border border-[var(--border-1)] bg-[var(--glass)] text-sm outline-none focus:ring-2 focus:ring-[var(--focus)]"
        />
        {normalizedQ && searchResults.length > 0 && (
          <div className="mt-2 max-h-64 overflow-auto rounded-lg border border-[var(--border-1)] bg-[var(--glass)]">
            {searchResults.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setQ("");
                  focusNodeById(r.id);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-white/10"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: getCategoryColor(r.category) }}
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
        style={{
          width: selectedId ? Math.max(360, dims.w - (PANEL_W + PANEL_GAP)) : dims.w,
          height: dims.h,
        }}
      >
        <ForceGraph2D
          ref={fgRef}
          width={selectedId ? Math.max(360, dims.w - (PANEL_W + PANEL_GAP)) : dims.w}
          height={dims.h}
          graphData={graph}
          backgroundColor="transparent"
          cooldownTicks={90}
          enableZoomInteraction
          enablePanInteraction
          onBackgroundClick={onBackgroundClick}
          onNodeClick={onNodeClick}
          onNodeHover={onNodeHover}
          nodeRelSize={6}
          nodeCanvasObject={drawNode}
          linkCanvasObjectMode={() => "after"}
          linkCanvasObject={linkCanvasObject}
        />
      </div>

      {/* Panel */}
      {selectedScheme && (
        <aside
          className="absolute top-0 right-0 h-full border-l border-[var(--border-1)] bg-[var(--glass)] backdrop-blur p-4 overflow-y-auto"
          style={{ width: PANEL_W }}
          role="region"
          aria-live="polite"
        >
          <div className="text-sm uppercase tracking-wide text-[color:var(--text-2)]">
            {selectedScheme.category}
          </div>
          <h3
            className="text-xl font-semibold text-[color:var(--text-1)] mt-0.5"
            style={{ textShadow: "0 0 12px rgba(122,162,255,0.25)" }}
          >
            {selectedScheme.title}
          </h3>
          <div className="mt-1 text-xs">
            <span
              className={`px-2 py-0.5 rounded-full ${
                selectedScheme.mandatory
                  ? "bg-[var(--danger)]/20 text-[var(--danger)]"
                  : "bg-[var(--success)]/20 text-[var(--success)]"
              }`}
            >
              {selectedScheme.mandatory ? "Mandatory" : "Voluntary"}
            </span>
          </div>

          <div className="mt-4">
            <div className="text-sm font-semibold mb-2">Linked Schemes</div>
            {neighborsList.length === 0 ? (
              <div className="text-xs text-[var(--text-2)]">
                No links found (explicit relations or shared tags).
              </div>
            ) : (
              <ul className="space-y-2">
                {neighborsList.map((n) => (
                  <li
                    key={n.id}
                    className="rounded-lg p-2 border"
                    style={{
                      backgroundColor: "var(--chip)",
                      borderColor: "var(--chip-border)",
                    }}
                  >
                    <div className="text-xs text-[var(--text-2)]">
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
                        style={{ backgroundColor: getCategoryColor(n.category) }}
                      />
                      <span className="font-medium text-[var(--text-1)]">
                        {n.title.length > 52 ? n.title.slice(0, 51) + "…" : n.title}
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
                          <span className="opacity-90">{n.why.join(", ")}</span>
                        </>
                      ) : (
                        <span className="opacity-75">related by similarity</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <a
            href={`/schemes?q=${encodeURIComponent(selectedScheme.title)}`}
            className="inline-block mt-4 px-3 py-1 rounded-lg border border-[var(--border-1)] bg-[var(--glass)] text-sm hover:shadow-glow"
          >
            View in Repository
          </a>

          <button
            onClick={() => setSelectedId(null)}
            className="mt-3 block px-3 py-1 rounded-lg border border-[var(--border-1)] bg-[var(--glass)] text-sm"
          >
            Close
          </button>
        </aside>
      )}
    </div>
  );
}
