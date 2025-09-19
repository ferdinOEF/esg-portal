import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SchemeDetail({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code);
  const scheme = await prisma.scheme.findUnique({ where: { code } });
  if (!scheme) return notFound();

  const refItems = Array.isArray(scheme.references) ? (scheme.references as any[]) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{scheme.title}</h1>
          <div className="text-sm text-gray-600">
            <span>{scheme.category}</span>
            <span className="mx-2">•</span>
            <span>{scheme.issuingAuthority || "—"}</span>
            <span className="mx-2">•</span>
            <span className={scheme.mandatory ? "text-red-700" : "text-emerald-700"}>
              {scheme.mandatory ? "Mandatory" : "Voluntary"}
            </span>
          </div>
        </div>
        <Link href="/schemes" className="text-sm underline">Back to all schemes</Link>
      </div>

      {scheme.description ? (
        <section>
          <h2 className="text-lg font-medium mb-2">Overview</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{scheme.description}</p>
        </section>
      ) : null}

      {scheme.features && scheme.features.length > 0 ? (
        <section>
          <h2 className="text-lg font-medium mb-2">Key Features / Obligations</h2>
          <ul className="list-disc pl-5 space-y-1">
            {scheme.features.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </section>
      ) : null}

      <div className="grid md:grid-cols-2 gap-6">
        {scheme.eligibility ? (
          <section>
            <h3 className="font-medium mb-2">Eligibility / Applicability</h3>
            <p className="text-gray-800 whitespace-pre-wrap">{scheme.eligibility}</p>
          </section>
        ) : null}

        {scheme.process ? (
          <section>
            <h3 className="font-medium mb-2">Process / Workflow</h3>
            <p className="text-gray-800 whitespace-pre-wrap">{scheme.process}</p>
          </section>
        ) : null}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {scheme.benefits ? (
          <section>
            <h3 className="font-medium mb-2">Benefits / Risks</h3>
            <p className="text-gray-800 whitespace-pre-wrap">{scheme.benefits}</p>
          </section>
        ) : null}

        {scheme.deadlines ? (
          <section>
            <h3 className="font-medium mb-2">Key Dates / Deadlines</h3>
            <p className="text-gray-800 whitespace-pre-wrap">{scheme.deadlines}</p>
          </section>
        ) : null}
      </div>

      {refItems.length ? (
        <section>
          <h3 className="font-medium mb-2">References</h3>
          <ul className="list-disc pl-5 space-y-1">
            {refItems.map((r, i) => {
              const label = r?.label ?? `Reference ${i + 1}`;
              const url = r?.url as string | undefined;
              const filename = r?.filename as string | undefined;
              return (
                <li key={i} className="text-sm">
                  {url ? <a href={url} target="_blank" className="underline">{label}</a> : label}
                  {filename ? <span className="text-gray-600"> — {filename}</span> : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {(scheme.tags || []).length ? (
        <div className="flex flex-wrap gap-2">
          {scheme.tags.map((t) => (
            <Link
              key={t}
              href={`/schemes?tag=${encodeURIComponent(t)}`}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-200"
            >
              #{t}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
