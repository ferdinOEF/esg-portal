// app/companies/page.tsx
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";

export const runtime = "nodejs";
export const revalidate = 120;

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[color:var(--text-1)]">Companies</h1>
        <Link
          href="/companies/new"
          className="px-4 py-2 rounded-lg bg-[color:var(--glass)] border border-[color:var(--border-1)] hover:shadow-glow"
        >
          + Add Company
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="p-6 rounded-xl border border-[color:var(--border-1)] bg-[color:var(--glass)] text-[color:var(--text-2)]">
          No companies yet. Click “Add Company” to get started.
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((c) => (
            <li
              key={c.id}
              className="p-5 rounded-xl border border-[color:var(--border-1)] bg-[color:var(--glass)] hover:shadow-glow transition"
            >
              <Link href={`/companies/${c.id}`} className="text-lg font-medium text-[color:var(--text-1)] hover:underline">
                {c.name}
              </Link>
              <p className="text-sm text-[color:var(--text-2)] mt-1">
                {c.industry || "Industry: —"} · {c.export ? "Exporter" : "Domestic"}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {(c.tags || []).slice(0, 4).map((t) => (
                  <span key={t} className="text-[11px] px-2 py-0.5 rounded-full border"
                        style={{ backgroundColor: "var(--chip)", borderColor: "var(--chip-border)", color: "var(--text-2)" }}>
                    #{t}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
