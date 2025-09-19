import { prisma } from "@/src/lib/prisma";
import SchemesClient from "@/components/schemes/SchemesClient";
import { Suspense } from "react";
import SchemesSkeleton from "@/components/schemes/SchemesSkeleton";

export const runtime = "nodejs";     // ✅ Prisma needs Node runtime on Vercel
export const revalidate = 300;       // cacheable; adjust as needed

export default async function SchemesPage() {
  let schemes: any[] = [];
  try {
    schemes = await prisma.scheme.findMany({
      select: {
        id: true,
        code: true,
        title: true,
        category: true,
        issuingAuthority: true,
        mandatory: true,
        description: true,
        eligibility: true,
        process: true,
        benefits: true,
        deadlines: true,
        features: true,
        tags: true,
        references: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ category: "asc" }, { title: "asc" }],
    });
  } catch (e) {
    // Render a friendly, visible message instead of a blank page
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-2">Schemes</h1>
        <div className="rounded border bg-red-50 text-red-800 p-4">
          <p className="font-medium">Couldn’t load schemes.</p>
          <p className="text-sm opacity-80 mt-1">
            This usually happens if the page ran on the Edge runtime or the database isn’t reachable.
          </p>
          <ul className="text-sm list-disc pl-5 mt-2">
            <li>Make sure <code>DATABASE_URL</code> (Neon) is set in Vercel → Project → Settings → Environment Variables.</li>
            <li>Ensure migrations ran: <code>npx prisma migrate deploy</code></li>
            <li>Seed data: <code>npx ts-node prisma/seed.ts</code> (or <code>npm run seed</code> if it uses <code>npx</code>).</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<SchemesSkeleton />}>
      <SchemesClient initialSchemes={schemes} />
    </Suspense>
  );
}
