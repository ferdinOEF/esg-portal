import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";

async function createCompany(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const industry = String(formData.get("industry") || "").trim();
  if (!name) return;
  await prisma.company.create({ data: { name, industry: industry || null } });
  revalidatePath("/companies");
}

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Companies</h1>
      <form action={createCompany} className="flex gap-2">
        <input name="name" placeholder="Name" className="border rounded px-3 py-2" />
        <input name="industry" placeholder="Industry" className="border rounded px-3 py-2" />
        <button className="px-3 py-2 rounded bg-black text-white">Add</button>
      </form>
      <ul className="space-y-2">
        {companies.map(c => (
          <li key={c.id} className="rounded border bg-white p-3 flex justify-between">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-gray-600">{c.industry || "—"}</div>
            </div>
            <Link href={`/companies/${c.id}`} className="text-sm underline">Open</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
