// app/godmode/page.tsx
import React from "react";
import { prisma } from "@/src/lib/prisma";
import ESGRadar from "@/components/godmode/ESGRadar";
import Mindmap from "@/components/godmode/Mindmap";

export const runtime = "nodejs";
export const revalidate = 60;

export default async function GodModePage() {
  const [schemes, relations] = await Promise.all([
    prisma.scheme.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        tags: true,
        mandatory: true,
      },
      orderBy: [{ category: "asc" }, { title: "asc" }],
      take: 600,
    }),
    prisma.relation.findMany({
      select: { fromId: true, toId: true, type: true, note: true },
      take: 2000,
    }),
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-0)] bg-[radial-gradient(1200px_600px_at_20%_-10%,#14203b_15%,transparent),radial-gradient(800px_400px_at_80%_-10%,#1d2f5e_10%,transparent)] text-[var(--text-1)]">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">GodMode</h1>
          <span className="text-sm text-[var(--text-2)]">
            ESG Control Center · MSME Focus
          </span>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <ESGRadar />
          </div>
          <div className="space-y-6 lg:col-span-2">
            <section className="relative">
              <h2 className="text-lg font-semibold mb-3">ESG Mindmap</h2>
              <Mindmap schemes={schemes as any} relations={relations as any} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
