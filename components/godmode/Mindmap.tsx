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
import * as d3 from "d3-force";

// Use the 2D build
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

type Props = {
  schemes: Scheme[];
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

const PANEL_W = 360;
const PANEL_GAP = 16;

export default function Mindmap({ schemes }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fgRef = useRef<any>(null);

  const [dims, setDims] = useState({ w: 1200, h: 600 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  // UX toggles
  const [clusterByCategory, setClusterByCategory] = useState(true);
  const [showAllLabels, setShowAllLabels] = useState(false);
  const [showEdges, setShowEdges] = useState(true);

  // Observe container size (responsive)
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setDims((d) => ({ ...d, w: e.contentRect.width }));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Unique categories for lane layout
  const categories = useMemo(
    () => Array.from(new Set(schemes.map((s) => s.category))).sort(),
    [schemes]
  );
  const catIndex: Record<string, number> = useMemo(() => {
    const m: Record<string, number> = {};
    categories.forEach((c, i) => (m[c] = i));
    return m;
  }, [categories]);

  // Build graph with tag-overlap edges
  const graph = useMemo(() => {
    const nodes = schemes.map((s) => ({
      id: s.id,
      name: s.title,
      category: s.category,
      mandatory: s.mandatory,
      tags: (s.tags || []).map((t) => t.toLowerCase()),
    }));
    const links: Array<{ source: string; target: string; why?: string[]; w?: number }> = [];

    for (let i = 0; i < schemes.length; i++) {
      for (let j = i + 1; j < schemes.length; j++) {
        const a = schemes[i];
        const b = schemes[j];
        const ta = (a.tags || []).map((t) => t.toLowerCase());
        const tb = (b.tags || []).map((t) => t.toLowerCase());
        if (!ta.length || !tb.length) continue;
        const overlap = ta.filter((t) => tb.includes(t));
        if (overlap.length && a.category !== b.category) {
          links.push({ source: a.id, target: b.id, why: overlap.slice(0, 3), w: Math.min(3, overlap.length) });
        }
      }
    }

    // degree centrality (for size)
    const degree: Record<string, number> = {};
    nodes.forEach((n) => (degree[n.id] = 0));
    links.forEach((l) => {
      degree[l.source] = (degree[l.source] ?? 0) + 1;
      degree[l.target] = (degree[l.target] ?? 0) + 1;
    });

    return { nodes, links, degree };
  }, [schemes]);

  // Neighbor sets for focus mode
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

  // Clicking a node focuses neighborhood
  const onNodeClick = useCallback(
    (node: any) => {
      setSelectedId(node.id);
      const { n, el } = computeNeighbors(node.id);
      setHighlightNodes(n);
      setHighlightLinks(el);

      // Smooth zoom & center
      const t = 600;
      const zoom = 2.0;
      if (typeof node.x === "number" && typeof node.y === "number") {
        fgRef.current?.centerAt(node.x, node.y, t);
        fgRef.current?.zoom(zoom, t);
      }
    },
    [computeNeighbors]
  );

  // Hover—subtle highlight
  const onNodeHover = useCallback(
    (node: any | null) => setHoverId(node?.id ?? null),
    []
  );

  const onBackgroundClick = useCallback(() => {
    setSelectedId(null);
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    fgRef.current?.zoomToFit(160, 600);
  }, []);

  // Refit graph when panel state changes or after mount
  useEffect(() => {
    const id = setTimeout(() => fgRef.current?.zoomToFit(160, 700), 350);
    return () => clearTimeout(id);
  }, [selectedId]);

  // Apply forces (clustering + collision + link distance)
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;

    // Link distance based on tag overlap weight (w: 1–3)
    const linkForce = fg.d3Force("link");
    linkForce?.distance((l: any) => 80 + 40 * (3 - (l.w || 1)));
    linkForce?.strength(0.9);

    // Repulsion + collision
    fg.d3Force("charge", d3.forceManyBody().strength(-180));
    fg.d3Force("collide", (d3 as any).forceCollide?.(12));

    // Category lanes (forceX) to prevent a big clump
    if (clusterByCategory) {
      const cols = Math.max(1, categories.length);
      fg.d3Force(
        "forceX",
        d3
          .forceX((node: any) => {
            const idx = catIndex[node.category] ?? 0;
            const canvasW =
              selectedId ? Math.max(320, dims.w - (PANEL_W + PANEL_GAP)) : dims.w;
            const gutter = 24;
            const usable = canvasW - gutter * 2;
            const step = usable / Math.max(1, cols - 1);
            return gutter + idx * step;
          })
          .strength(0.08)
      );
      fg.d3Force("forceY", d3.forceY(dims.h / 2).strength(0.04));
    } else {
      fg.d3Force("forceX", null);
      fg.d3Force("forceY", null);
    }

    // Tweak alpha decay so layout breathes but settles
    fg.d3AlphaDecay(0.02);
  }, [clusterByCategory, categories.length, catIndex, dims.w, dims.h, selectedId]);

  // Canvas width (shrink when panel open)
  const graphWidth = selectedId
    ? Math.max(360, dims.w - (PANEL_W + PANEL_GAP))
    : dims.w;

  // Info panel data
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

  // Draw node with adaptive label & degree size
  const drawNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const id = node.id as string;
      const hot =
        highlightNodes.has(id) ||
        id === selectedId ||
        (hoverId && (id === hoverId || highlightNodes.has(hoverId)));
      const col = getCategoryColor(node.category as string);

      const degree = (graph as any).degree?.[id] ?? 0;
      const r = Math.min(12, 6 + Math.sqrt(degree)); // degree-based size

      // Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, hot ? r + 2 : r, 0, 2 * Math.PI, false);
      ctx.fillStyle = hot ? col : "rgba(255,255,255,0.22)";
      ctx.fill();
      ctx.lineWidth = hot ? 2 : 1;
      ctx.strokeStyle = col;
      ctx.stroke();

      // Label rules:
      // - always for selected/hover
      // - if showAllLabels = true
      // - if zoomed in enough (globalScale < 0.9 → tiny, > 1.3 → readable)
      const mustShowLabel =
        showAllLabels || hot || globalScale > 1.3;

      if (mustShowLabel) {
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

      {/* Graph canvas */}
      <div
        className="transition-[width] duration-300 ease-out"
        style={{ width: graphWidth, height: dims.h }}
      >
        <ForceGraph2D
          ref={fgRef}
          width={graphWidth}
          height={dims.h}
          graphData={graph}
          backgroundColor="transparent"
          cooldownTicks={90}
          enableZoomInteraction
          enablePanInteraction
          onBackgroundClick={onBackgroundClick}
          onNodeClick={onNodeClick}
          onNodeHover={onNodeHover}
          // links
          linkColor={() => (showEdges ? "rgba(255,255,255,0.2)" : "transparent")}
          linkWidth={(link: any) => (highlightLinks.has(link) ? 2.8 : 1)}
          linkDirectionalParticles={(link: any) => (highlightLinks.has(link) ? 2 : 0)}
          // nodes
          nodeRelSize={6}
          nodeCanvasObject={drawNode}
        />
      </div>

      {/* Right-side info panel */}
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
                No links found (based on shared tags).
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
                      {n.why.length ? (
                        <>shares tags: <span className="opacity-90">{n.why.join(", ")}</span></>
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
