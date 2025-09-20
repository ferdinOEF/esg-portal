// app/godmode/page.tsx
import React from "react";
import { prisma } from "@/src/lib/prisma";
import Mindmap from "@/components/godmode/Mindmap";

export const runtime = "nodejs";
export const revalidate = 60;

export default async function GodModePage() {
  const schemes = await prisma.scheme.findMany({
    select: {
      id: true,
      title: true,
      category: true,
      tags: true,
      mandatory: true,
      issuingAuthority: true,
      description: true,
      features: true,
    },
    orderBy: [{ category: "asc" }, { title: "asc" }],
    take: 400, // safety cap
  });

  return (
    <div className="min-h-screen bg-[var(--bg-0)] bg-[radial-gradient(1200px_600px_at_20%_-10%,#14203b_15%,transparent),radial-gradient(800px_400px_at_80%_-10%,#1d2f5e_10%,transparent)] text-[var(--text-1)]">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">GodMode</h1>
          <span className="text-sm text-[var(--text-2)]">ESG Control Center · MSME Focus</span>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <section className="p-4 rounded-2xl bg-[var(--glass)] border border-[var(--border-1)] backdrop-blur">
              <h2 className="text-lg font-semibold mb-3">ESG Radar</h2>
              <div className="text-[var(--text-2)] text-sm">
                [Placeholder] Live news, updates, compliance changes for MSMEs.
              </div>
            </section>

            <section className="p-4 rounded-2xl bg-[var(--glass)] border border-[var(--border-1)] backdrop-blur">
              <h2 className="text-lg font-semibold mb-3">Regulation Timeline</h2>
              <div className="text-[var(--text-2)] text-sm">
                [Placeholder] Interactive timeline of ESG frameworks (2010–2030).
              </div>
            </section>
          </div>

          {/* Center (2 cols) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Mindmap */}
            <section className="relative">
              <h2 className="text-lg font-semibold mb-3">ESG Mindmap</h2>
              <Mindmap schemes={schemes as any} />
            </section>

            {/* Heatmap placeholder */}
            <section className="p-6 rounded-2xl bg-[var(--glass)] border border-[var(--border-1)] backdrop-blur h-[400px] flex items-center justify-center">
              <h2 className="text-lg font-semibold absolute top-4 left-4">Compliance Heatmap</h2>
              <div className="text-[var(--text-2)] text-sm text-center">
                [Placeholder] India/Goa MSME compliance exposure map.
              </div>
            </section>

            {/* GodView quick metrics */}
            <section className="p-6 rounded-2xl bg-[var(--glass)] border border-[var(--border-1)] backdrop-blur">
              <h2 className="text-lg font-semibold mb-3">Your GodView</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-xl bg-[var(--chip)] border border-[var(--chip-border)]">
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-xs text-[var(--text-2)]">Active Schemes</div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--chip)] border border-[var(--chip-border)]">
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-xs text-[var(--text-2)]">Compliant MSMEs</div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--chip)] border border-[var(--chip-border)]">
                  <div className="text-2xl font-bold">4</div>
                  <div className="text-xs text-[var(--text-2)]">At Risk</div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--chip)] border border-[var(--chip-border)]">
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-xs text-[var(--text-2)]">Critical Alerts</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
