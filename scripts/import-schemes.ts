import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

type RefItem = { label?: string; url?: string; filename?: string };
type SchemeRow = {
  code: string;
  title: string;
  category: string;
  issuingAuthority?: string;
  mandatory: boolean;
  description?: string;
  eligibility?: string;
  process?: string;
  benefits?: string;
  deadlines?: string;
  features?: string[];
  tags?: string[];
  references?: RefItem[]; // stored as Json in Prisma
};

async function main() {
  const jsonPath = path.join(process.cwd(), "prisma", "schemes.seed.json");
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const items: SchemeRow[] = JSON.parse(raw);

  for (const s of items) {
    await prisma.scheme.upsert({
      where: { code: s.code },
      update: {
        title: s.title,
        category: s.category,
        issuingAuthority: s.issuingAuthority,
        mandatory: s.mandatory,
        description: s.description,
        eligibility: s.eligibility,
        process: s.process,
        benefits: s.benefits,
        deadlines: s.deadlines,
        features: s.features ?? [],
        tags: s.tags ?? [],
        references: s.references ?? [],
      },
      create: {
        code: s.code,
        title: s.title,
        category: s.category,
        issuingAuthority: s.issuingAuthority,
        mandatory: s.mandatory,
        description: s.description,
        eligibility: s.eligibility,
        process: s.process,
        benefits: s.benefits,
        deadlines: s.deadlines,
        features: s.features ?? [],
        tags: s.tags ?? [],
        references: s.references ?? []
      },
    });
  }

  const count = await prisma.scheme.count();
  console.log(`Imported/updated ${items.length} schemes. Total now in DB: ${count}`);
}

main()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
