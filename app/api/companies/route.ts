// app/api/companies/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  const companies = await prisma.company.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(companies);
}

export async function POST(req: Request) {
  const data = await req.json();

  // Minimal input guard
  if (!data?.name || typeof data.name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const company = await prisma.company.create({
    data: {
      name: data.name.trim(),
      industry: data.industry ?? null,
      employees: data.employees ?? null,
      revenueBand: data.revenueBand ?? null,
      export: !!data.export,
      exportRegions: Array.isArray(data.exportRegions) ? data.exportRegions : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
    },
  });

  return NextResponse.json(company, { status: 201 });
}
