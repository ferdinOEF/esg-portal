// components/godmode/Mindmap.tsx
"use client";

import React, { useRef, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";

// dynamic import avoids SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph").then(mod => mod.ForceGraph2D), { ssr: false });

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

// category → color mapping
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

  // Build graph data
  const data = useMemo(() => {
    const nodes = schemes.map((s) => ({
      id: s.id,
      name: s.title,
      category: s.category,
      mandatory: s.mandatory,
    }));

    const links: { source: string; target: string }[] = [];

    // simple: link nodes that share a tag across categories
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

  // highlight state
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());

  const handleNodeClick = useCallback((node: any) => {
    setSelectedId(node.id);

    const newHLNodes = new Set();
    const newHLLinks = new Set();

    data.links.forEach((l: any) => {
      if (l.source.id === node.id || l.target.id === node.id) {
        newHLNodes.add(l.source.id);
        newHLNodes.add(l.target.id);
        newHLLinks.add(l);
      }
    });

    newHLNodes.add(node.id);

    setHighlightNodes(newHLNodes);
    setHighlightLinks(newHLLinks);
  }, [data.links]);

  return (
    <div className="relative h-[600px] w-full rounded-2xl border border-[var(--border-1)] bg-[var(--glass)] backdrop-blur">
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeAutoColorBy="category"
        backgroundColor="transparent"
        linkColor={() => "rgba(255,255,255,0.2)"}
        linkWidth={(link: any) => (highlightLinks.has(link) ? 2.5 : 1)}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={(link: any) => (highlightLinks.has(link) ? 2 : 0)}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          const color = getCategoryColor(node.category);

          ctx.beginPath();
          ctx.arc(node.x, node.y, highlightNodes.has(node.id) ? 10 : 6, 0, 2 * Math.PI, false);
          ctx.fillStyle = highlightNodes.has(node.id) ? color : "rgba(255,255,255,0.2)";
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = highlightNodes.has(node.id) ? 2 : 1;
          ctx.stroke();

          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = "white";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(label.length > 22 ? label.slice(0, 22) + "…" : label, node.x + 8, node.y);
        }}
        onNodeClick={handleNodeClick}
        cooldownTicks={100}
        enableZoomInteraction
        enablePanInteraction
      />

      {/* Right-side details panel */}
      {selectedId && (
        <div className="absolute top-0 right-0 h-full w-80 bg-[var(--glass)] border-l border-[var(--border-1)] backdrop-blur p-4 overflow-y-auto">
          {(() => {
            const s = schemes.find((x) => x.id === selectedId);
            if (!s) return null;
            return (
              <div>
                <div className="text-sm uppercase text-[var(--text-2)]">{s.category}</div>
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
                <button
                  onClick={() => setSelectedId(null)}
                  className="mt-3 px-3 py-1 rounded-lg border border-[var(--border-1)] bg-[var(--glass)] text-sm"
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
