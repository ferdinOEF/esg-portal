import { prisma } from "@/src/lib/prisma";

export default async function EvidencePage() {
  const evidences = await prisma.evidence.findMany({
    include: { requirement: true, company: true, file: true },
    orderBy: { uploadedAt: "desc" }
  });
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Evidence</h1>
      <div className="grid gap-3">
        {evidences.map(e => (
          <div key={e.id} className="rounded border bg-white p-4">
            <div className="font-medium">{e.title}</div>
            <div className="text-sm text-gray-600">
              {e.company?.name} • {e.requirement?.code} — {e.requirement?.title}
            </div>
            {e.file ? <div className="text-xs mt-1">File: {e.file.filename} ({e.file.mimeType})</div> : null}
            {e.url ? <a className="text-xs underline" href={e.url} target="_blank">Open URL</a> : null}
          </div>
        ))}
      </div>
    </div>
  )
}
