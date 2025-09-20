// components/godmode/Mindmap.tsx
"use client";

import React, { useRef, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";

// IMPORTANT: use the 2D entry for the package
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

export default function Mindmap({ schemes }: Props) {
  const fgRef = useRef<any>();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Build graph data: nodes + tag-based links (across categories)
  const data = useMemo(() => {
    const nodes = schemes.map((s) => ({
      id: s.id,
      name: s.title,
      category: s.category,
      mandatory: s.mandatory,
      // initial coords help reduce initial “jump”
      fx: undefined as number | undefined,
      fy: undefined as number | undefined,
    }));

    const links: { source: string; target: string }[] = [];
    for (let i = 0; i < schemes.length; i++) {
      for (let j = i + 1; j < schemes.length; j++) {
        const a = schemes[i];
        const b = schemes[j];
        if (!a.tags?.length || !b.tags?.length) continue;
        const overlap = a.tags.some((t) => b.tags!.includes(t));
        if (overlap && a.category !== b.category) {
          links.push({ source: a.id, target: b.id });
        }
      }
    }
    return { nodes, links };
  }, [schemes]);

  // neighbor highlighting
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<any>>(new Set());

  const handleNodeClick = useCallback(
    (node: any) => {
      setSelectedId(node.id);

      const newHLNodes = new Set<string>();
      const newHLLinks = new Set<any>();

      (data.links as any[]).forEach((l) => {
        const src = typeof l.source === "object" ? l.source.id : l.source;
        const tgt = typeof l.target === "object" ? l.target.id : l.target;
        if (src === node.id || tgt === node.id) {
          newHLNodes.add(src);
          newHLNodes.add(tgt);
          newHLLinks.add(l);
        }
      });

      newHLNodes.add(node.id);
      setHighlightNodes(newHLNodes);
      setHighlightLinks(newHLLinks);

      // Smooth zoom & center on clicked node
      const dist = 140;
      const zoom = 2.0;
      const t = 600;
      fgRef.current?.zoomToFit(dist, t, (n: any) => n.id === node.id);
      if (typeof node.x === "number" && typeof node.y === "number") {
        fgRef.current?.centerAt(node.x, node.y, t);
        fgRef.current?.zoom(zoom, t);
      }
    },
    [data.links]
  );

  const handleBackgroundClick = useCallback(() => {
    setSelectedId(null);
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    fgRef.current?.zoomToFit(200, 600);
  }, []);

  return (
    <div className="relative h-[600px] w-full rounded-2xl border border-[var(--border-1)] bg-[var(--glass)] backdrop-blur">
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
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

          // Label
          const fontSize = Math.max(10, 12 / globalScale);
          ctx.font = `${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`;
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "rgba(230,235,255,0.95)";
          const text = label.length > 28 ? label.slice(0, 28) + "…" : label;
          ctx.fillText(text, node.x + 10, node.y);
        }}
      />

      {/* Right-side details panel */}
      {selectedId && (
        <div className="absolute top-0 right-0 h-full w-80 bg-[var(--glass)] border-l border-[var(--border-1)] backdrop-blur p-4 overflow-y-auto">
          {(() => {
            const s = schemes.find((x) => x.id === selectedId);
            if (!s) return null;
            return (
              <div>
                <div className="text-sm uppercase text-[var(--text-2)]">
                  {s.category}
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-1)] mt-1">
                  {s.title}
                </h3>
                <div className="mt-1 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-full ${
                      s.mandatory
                        ? "bg-[var(--danger)]/20 text-[var(--danger)]"
                        : "bg-[var(--success)]/20 text-[var(--success)]"
                    }`}
                  >
                    {s.mandatory ? "Mandatory" : "Voluntary"}
                  </span>
                </div>

                {s.tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {s.tags.slice(0, 10).map((t) => (
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
                ) : null}

                <a
                  href={`/schemes?q=${encodeURIComponent(s.title)}`}
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
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
