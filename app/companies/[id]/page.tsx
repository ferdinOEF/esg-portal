// app/companies/[id]/page.tsx
import { prisma } from "@/src/lib/prisma";
import { evaluateCompany } from "@/src/lib/rules/evaluator";

export const runtime = "nodejs";
export const revalidate = 60;

export default async function CompanyPage({ params }: { params: { id: string } }) {
  const company = await prisma.company.findUnique({ where: { id: params.id } });
  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-[color:var(--text-2)]">
        Company not found.
      </div>
    );
  }

  const schemes = await prisma.scheme.findMany({
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });
  const suggestions = evaluateCompany(company, schemes);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Overview */}
      <section className="p-6 rounded-xl border border-[color:var(--border-1)] bg-[color:var(--glass)]">
        <h1 className="text-2xl font-semibold text-[color:var(--text-1)]">{company.name}</h1>
        <div className="mt-2 grid sm:grid-cols-2 gap-3 text-[color:var(--text-2)]">
          <div><span className="text-sm">Industry:</span> {company.industry || "—"}</div>
          <div><span className="text-sm">Employees:</span> {company.employees ?? "—"}</div>
          <div><span className="text-sm">Revenue band:</span> {company.revenueBand || "—"}</div>
          <div><span className="text-sm">Export:</span> {company.export ? "Yes" : "No"}</div>
        </div>
        {(company.tags || []).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {company.tags.map((t) => (
              <span key={t} className="text-[11px] px-2 py-0.5 rounded-full border"
                    style={{ backgroundColor: "var(--chip)", borderColor: "var(--chip-border)", color: "var(--text-2)" }}>
                #{t}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Suggestions summary */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-[color:var(--text-1)]">Suggested Schemes</h2>
        {suggestions.length === 0 ? (
          <div className="p-6 rounded-xl border border-[color:var(--border-1)] bg-[color:var(--glass)] text-[color:var(--text-2)]">
            No applicable schemes found yet. Try adding tags like <code>goa</code>, <code>producer</code>,
            or mark as <code>Exporter</code> in the company profile.
          </div>
        ) : (
          <ul className="space-y-3">
            {suggestions.map((s) => (
              <li key={s.scheme.id} className="p-5 rounded-xl border border-[color:var(--border-1)] bg-[color:var(--glass)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-[color:var(--text-1)]">{s.scheme.title}</h3>
                    <p className="text-sm text-[color:var(--text-2)]">{s.reason}</p>
                    <div className="mt-2 text-xs text-[color:var(--text-2)]">Score: {s.score}</div>
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 text-[11px] rounded-full ${
                      s.mandatory
                        ? "bg-[var(--danger)]/20 text-[var(--danger)]"
                        : "bg-[var(--success)]/20 text-[var(--success)]"
                    }`}
                  >
                    {s.mandatory ? "Mandatory" : "Voluntary"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
