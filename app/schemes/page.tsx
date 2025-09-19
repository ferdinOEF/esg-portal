import { prisma } from "@/src/lib/prisma";
import Link from "next/link";

function groupBy<T, K extends string | number>(arr: T[], key: (t: T) => K) {
  return arr.reduce((acc, item) => {
    const k = key(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

export default async function SchemesPage({ searchParams }: { searchParams?: { q?: string; tag?: string } }) {
  const q = (searchParams?.q || "").toLowerCase();
  const tag = (searchParams?.tag || "").toLowerCase();

  const schemes = await prisma.scheme.findMany({
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });

  const filtered = schemes.filter((s) => {
    const matchQ =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      (s.description ?? "").toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.issuingAuthority?.toLowerCase().includes(q);
    const matchTag = !tag || (s.tags || []).some((t) => t.toLowerCase().includes(tag));
    return matchQ && matchTag;
  });

  const byCat = groupBy(filtered, (s) => s.category);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Schemes, Certifications & Frameworks</h1>
        <form className="flex gap-2">
          <input
            type="text"
            name="q"
            placeholder="Search schemes..."
            defaultValue={q}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            name="tag"
            placeholder="Filter by tag (e.g., reporting)"
            defaultValue={tag}
            className="border rounded px-3 py-2"
          />
          <button className="px-3 py-2 rounded bg-black text-white">Apply</button>
        </form>
      </div>

      {Object.entries(byCat).length === 0 ? (
        <div className="text-sm text-gray-600">No schemes found.</div>
      ) : (
        Object.entries(byCat).map(([category, items]) => (
          <section key={category} className="space-y-3">
            <h2 className="text-lg font-medium">{category}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((s) => (
                <Link
                  key={s.id}
                  href={`/schemes/${encodeURIComponent(s.code)}`}
                  className="rounded-2xl border bg-white p-4 hover:shadow transition"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">{s.title}</h3>
                    {s.mandatory ? (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Mandatory</span>
                    ) : (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Voluntary</span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    <div className="truncate">{s.issuingAuthority || "—"}</div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(s.tags || []).slice(0, 5).map((t) => (
                      <span key={t} className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
