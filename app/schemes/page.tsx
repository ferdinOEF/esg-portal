// app/schemes/page.tsx
import { prisma } from "@/src/lib/prisma";
import SchemesClient from "@/components/schemes/SchemesClient";
import { Suspense } from "react";
import SchemesSkeleton from "@/components/schemes/SchemesSkeleton";

export const runtime = "nodejs";
export const revalidate = 300;

export default async function SchemesPage() {
  const schemes = await prisma.scheme.findMany({
    select: {
      id: true, code: true, title: true, category: true, issuingAuthority: true,
      mandatory: true, description: true, eligibility: true, process: true,
      benefits: true, deadlines: true, features: true, tags: true, references: true,
      createdAt: true, updatedAt: true,
    },
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });

  return (
    <div className="min-h-screen bg-night text-[color:var(--text-1)]">
      <Suspense fallback={<SchemesSkeleton />}>
        <SchemesClient initialSchemes={schemes} />
      </Suspense>
    </div>
  );
}
