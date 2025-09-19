import { prisma } from "@/src/lib/prisma";

export default async function FrameworksPage() {
  const frameworks = await prisma.framework.findMany({ include: { requirements: true } });
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Frameworks</h1>
      <div className="grid gap-4">
        {frameworks.map(f => (
          <div key={f.id} className="rounded border bg-white p-4">
            <h2 className="font-medium">{f.title} <span className="text-gray-500 text-sm">({f.code})</span></h2>
            <p className="text-sm text-gray-600">{f.description}</p>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {f.requirements.map(r => (
                <li key={r.id}><span className="font-medium">{r.code}</span>: {r.title}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
