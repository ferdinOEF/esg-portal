// app/godmode/page.tsx
import { prisma } from "@/src/lib/prisma";
import Mindmap from "@/components/godmode/Mindmap";
import EsgRadar from "@/components/godmode/EsgRadar";
import GoaHeatmap from "@/components/godmode/GoaHeatmap";

export const runtime = "nodejs";

export default async function GodModePage() {
  // Keep it robust: basic fields only
  const schemes = await prisma.scheme.findMany({
    select: { id: true, title: true, category: true, tags: true, mandatory: true },
    orderBy: { title: "asc" },
  });

  // If you have Relation model; if not, keep [].
  let relations: Array<{
    fromId: string;
    toId: string;
    type: "REQUIRES" | "ALIGNS_WITH" | "CONFLICTS_WITH";
    note: string | null;
  }> = [];
  try {
    relations = await prisma.relation.findMany({
      select: { fromId: true, toId: true, type: true, note: true },
    });
  } catch {
    relations = [];
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 text-[var(--text-1)]">
      {/* Header / Subtitle */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">GodMode</h1>
        <div className="text-sm text-[var(--text-2)]">
          ESG Control Center · MSME Focus
        </div>
      </div>

      {/* Top row: ESG Radar + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <section className="rounded-2xl border border-[var(--border-1)] bg-[var(--glass)] backdrop-blur p-4">
          <h2 className="text-xl font-semibold mb-3">ESG Radar</h2>
          <EsgRadar />
        </section>

        <section className="rounded-2xl border border-[var(--border-1)] bg-[var(--glass)] backdrop-blur p-4">
          <h2 className="text-xl font-semibold mb-3">Compliance Heatmap (Goa)</h2>
          <GoaHeatmap />
        </section>
      </div>

      {/* Mindmap */}
      <section className="rounded-2xl">
        <h2 className="text-xl font-semibold mb-3">ESG Mindmap</h2>
        <Mindmap schemes={schemes} relations={relations} />
      </section>
    </main>
  );
}
