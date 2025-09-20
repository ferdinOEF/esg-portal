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

// IMPORTANT: use the 2D build
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

// Category → color mapping (same as elsewhere)
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

const PANEL_W = 360; // right info panel width
const PANEL_GAP = 16;

export default function Mindmap({ schemes }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fgRef = useRef<any>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dims, setDims] = useState({ w: 1000, h: 600 });

  // Resize observer → keep canvas sized to container (minus panel when open)
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const rect = e.contentRect;
        setDims((d) => ({ ...d, w: rect.width }));
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Build graph: nodes + tag-based links (cross-category only)
  const graph = useMemo(() => {
    const nodes = schemes.map((s) => ({
      id: s.id,
      name: s.title,
      category: s.category,
      mandatory: s.mandatory,
      tags: (s.tags || []).map((t) => t.toLowerCase()),
    }));

    const links: { source: string; target: string; why?: string[] }[] = [];
    for (let i = 0; i < schemes.length; i++) {
      for (let j = i + 1; j < schemes.length; j++) {
        const a = schemes[i];
        const b = schemes[j];
        const ta = (a.tags || []).map((t) => t.toLowerCase());
        const tb = (b.tags || []).map((t) => t.toLowerCase());
        if (!ta.length || !tb.length) continue;

        // tag overlap
        const overlap = ta.filter((t) => tb.includes(t));
        if (overlap.length && a.category !== b.category) {
          links.push({ source: a.id, target: b.id, why: overlap.slice(0, 3) });
        }
      }
    }
    return { nodes, links };
  }, [schemes]);

  // neighbor sets for highlighting + panel content
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

  const handleNodeClick = useCallback(
    (node: any) => {
      setSelectedId(node.id);
      const { n, el } = computeNeighbors(node.id);
      setHighlightNodes(n);
      setHighlightLinks(el);

      // Zoom & center on clicked node (with panel gutter)
      const t = 600;
      const zoom = 2.0;
      // First, center on node
      if (typeof node.x === "number" && typeof node.y === "number") {
        fgRef.current?.centerAt(node.x, node.y, t);
        fgRef.current?.zoom(zoom, t);
      }
    },
    [computeNeighbors]
  );

  const handleBackgroundClick = useCallback(() => {
    setSelectedId(null);
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    // Fit graph in available area
    fgRef.current?.zoomToFit(180, 700);
  }, []);

  // Fit graph on first load & whenever panel open state changes (because width changes)
  useEffect(() => {
    const id = setTimeout(() => {
      fgRef.current?.zoomToFit(180, 700);
    }, 300);
    return () => clearTimeout(id);
  }, [selectedId]);

  // Forces tuning
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    // Pull in forces from d3-force via the instance
    fg.d3Force("charge")?.strength(-140); // repel more
    fg.d3Force("link")?.distance(110).strength(0.9); // tighter but readable
    // collision via many-body approximation: use nodeRelSize & repel
  }, []);

  // Canvas dimensions: leave gutter when panel is open
  const graphWidth = selectedId
    ? Math.max(320, dims.w - (PANEL_W + PANEL_GAP))
    : dims.w;

  // helpers
  const selectedScheme = selectedId
    ? schemes.find((s) => s.id === selectedId) || null
    : null;

  const neighborsList = useMemo(() => {
    if (!selectedId) return [];
    // Build neighbor items with "why" tags
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
    // sort by category asc then title
    items.sort((a, b) =>
      a.category === b.category
        ? a.title.localeCompare(b.title)
        : a.category.localeCompare(b.category)
    );
    return items;
  }, [selectedId, graph.links, schemes]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl border border-[var(--border-1)] bg-[var(--glass)] backdrop-blur"
      style={{ minHeight: 560 }}
    >
      {/* Controls */}
      <div className="absolute z-10 left-3 top-3 flex gap-3">
        <button
          onClick={() => fgRef.current?.zoomToFit(180, 700)}
          className="px-3 py-1 rounded-lg border border-[var(--border-1)] bg-[var(--glass)] text-xs hover:shadow-glow"
        >
          Fit
        </button>
        <button
          onClick={() => {
            setSelectedId(null);
            setHighlightNodes(new Set());
            setHighlightLinks(new Set());
            fgRef.current?.zoom(1, 400);
          }}
          className="px-3 py-1 rounded-lg border border-[var(--border-1)] bg-[var(--glass)] text-xs"
        >
          Reset
        </button>
      </div>

      {/* Graph canvas */}
      <div
        className="transition-[width] duration-300 ease-out"
        style={{
          width: graphWidth,
          height: dims.h,
        }}
      >
        <ForceGraph2D
          ref={fgRef}
          graphData={graph}
          width={graphWidth}
          height={dims.h}
          backgroundColor="transparent"
          onBackgroundClick={handleBackgroundClick}
          onNodeClick={handleNodeClick}
          cooldownTicks={80}
          enableZoomInteraction
          enablePanInteraction
          linkColor={() => "rgba(255,255,255,0.18)"}
          linkWidth={(link: any) => (highlightLinks.has(link) ? 2.8 : 1)}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={(link: any) =>
            highlightLinks.has(link) ? 2 : 0
          }
          nodeRelSize={6}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.name as string;
            const col = getCategoryColor(node.category as string);
            const hot = highlightNodes.has(node.id);

            // Node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, hot ? 9 : 6, 0, 2 * Math.PI, false);
            ctx.fillStyle = hot ? col : "rgba(255,255,255,0.22)";
            ctx.fill();
            ctx.lineWidth = hot ? 2 : 1;
            ctx.strokeStyle = col;
            ctx.stroke();

            // Truncated label
            const maxChars = 32;
            const text =
              label.length > maxChars ? label.slice(0, maxChars - 1) + "…" : label;

            const fontSize = Math.max(10, 12 / globalScale);
            ctx.font = `${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgba(230,235,255,0.95)";
            ctx.fillText(text, node.x + 10, node.y);
          }}
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

          {/* Neighbor list with short “why linked” bites */}
          <div className="mt-4">
            <div className="text-sm font-semibold mb-2">Linked Schemes</div>
            {neighborsList.length === 0 ? (
              <div className="text-xs text-[var(--text-2)]">
                No explicit links (based on shared tags) found.
              </div>
            ) : (
              <ul className="space-y-2">
                {neighborsList.slice(0, 12).map((n) => (
                  <li
                    key={n.id}
                    className="rounded-lg p-2 border"
                    style={{
                      backgroundColor: "var(--chip)",
                      borderColor: "var(--chip-border)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-[var(--text-2)]">
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
                          style={{ backgroundColor: getCategoryColor(n.category) }}
                        />
                        <span className="font-medium text-[var(--text-1)]">
                          {n.title.length > 40
                            ? n.title.slice(0, 39) + "…"
                            : n.title}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--text-2)]">
                      {n.why.length ? (
                        <span>
                          shares tags:{" "}
                          <span className="opacity-90">{n.why.join(", ")}</span>
                        </span>
                      ) : (
                        <span className="opacity-75">related by similarity</span>
                      )}
                    </div>
                    {n.tags.length ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {n.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-1.5 py-0.5 rounded-full border"
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
                    ) : null}
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
