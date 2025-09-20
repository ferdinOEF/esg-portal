/* prisma/seed.ts */
import { PrismaClient, RelationType } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Minimal shape matched to your Scheme model with required `code`.
 * Add optional fields here if your schema supports them (authority, url, summary, etc.).
 */
type SeedScheme = {
  code: string;            // required in your schema
  title: string;
  category: string;
  tags: string[];
  mandatory: boolean;
  // authority?: string | null;
  // url?: string | null;
  // summary?: string | null;
};

const schemesSeed: SeedScheme[] = [
  // ------- Core global/accounting/targets -------
  {
    code: "GHG",
    title: "GHG Protocol — Corporate Accounting Standard",
    category: "Carbon Accounting (Global)",
    tags: ["global", "carbon-accounting", "ghg", "scope1", "scope2", "scope3"],
    mandatory: false,
  },
  {
    code: "GRI",
    title: "GRI Standards — Sustainability Reporting",
    category: "Disclosure (Global)",
    tags: ["global", "disclosure", "reporting", "materiality"],
    mandatory: false,
  },
  {
    code: "IFRS-S1S2",
    title: "IFRS S1/S2 — Sustainability/Climate Disclosure",
    category: "Disclosure (Global)",
    tags: ["global", "investor", "disclosure", "climate"],
    mandatory: false,
  },
  {
    code: "SBTI",
    title: "Science Based Targets initiative (SBTi) — Targets",
    category: "Carbon Targets (Global)",
    tags: ["global", "targets", "ghg", "net-zero"],
    mandatory: false,
  },

  // ------- ISO management standards -------
  {
    code: "ISO-14001",
    title: "ISO 14001 — Environmental Management",
    category: "Management Systems (ISO)",
    tags: ["iso", "environment", "management-system"],
    mandatory: false,
  },
  {
    code: "ISO-9001",
    title: "ISO 9001 — Quality Management",
    category: "Management Systems (ISO)",
    tags: ["iso", "quality", "management-system"],
    mandatory: false,
  },
  {
    code: "ISO-45001",
    title: "ISO 45001 — Occupational Health & Safety",
    category: "Management Systems (ISO)",
    tags: ["iso", "oh&s", "safety", "management-system"],
    mandatory: false,
  },

  // ------- EU / product compliance -------
  {
    code: "EU-REACH",
    title: "EU REACH — Chemicals",
    category: "Chemicals (EU)",
    tags: ["eu", "chemicals", "substances", "reach"],
    mandatory: true,
  },
  {
    code: "EU-ROHS",
    title: "EU RoHS — Hazardous Substances in Electronics",
    category: "Product Compliance (India)", // keep as per your taxonomy
    tags: ["electronics", "hazardous", "rohs", "eu"],
    mandatory: true,
  },
  {
    code: "EU-WEEE",
    title: "EU WEEE — Waste Electrical & Electronic Equipment",
    category: "EPR & Waste (India)", // or EEE Compliance (EU) if you have it
    tags: ["eu", "electronics", "e-waste", "producer"],
    mandatory: true,
  },
  {
    code: "EU-EUDR",
    title: "EU Deforestation Regulation",
    category: "Due Diligence (EU)",
    tags: ["eu", "deforestation", "supply-chain", "due-diligence"],
    mandatory: true,
  },

  // ------- India / regulatory -------
  {
    code: "BRSR",
    title: "Business Responsibility and Sustainability Reporting (BRSR)",
    category: "Regulatory Frameworks (India)",
    tags: ["india", "sebi", "brsr", "disclosure", "reporting"],
    mandatory: true,
  },
  {
    code: "TEAM",
    title: "TEAM — Technology & Energy Audit for MSMEs",
    category: "Enablement/Certification (India)",
    tags: ["india", "msme", "energy", "enablement"],
    mandatory: false,
  },

  // ------- Trade & Carbon (EU) -------
  {
    code: "EU-CBAM",
    title: "EU CBAM — Carbon Border Adjustment Mechanism",
    category: "Trade & Carbon (EU)",
    tags: ["eu", "carbon", "border", "export", "cbam"],
    mandatory: true,
  },

  // ------- Goa / Coastal -------
  {
    code: "GOA-CZMP",
    title: "Goa Coastal Zone Management Plan (CZMP)",
    category: "Goa Environmental",
    tags: ["goa", "coastal", "czmp", "environment"],
    mandatory: true,
  },
  {
    code: "GOA-CRZ",
    title: "Coastal Regulation Zone (CRZ) — Goa",
    category: "Coastal/CRZ (Goa)",
    tags: ["goa", "coastal", "crz", "clearance"],
    mandatory: true,
  },
];

/**
 * Relations are declared by `code` for robust lookups.
 */
const relationsSeed: Array<{
  fromCode: string;
  toCode: string;
  type: RelationType;
  note?: string;
}> = [
  { fromCode: "EU-CBAM", toCode: "GHG", type: "REQUIRES", note: "CBAM needs embedded emission data." },
  { fromCode: "IFRS-S1S2", toCode: "GRI", type: "ALIGNS_WITH" },
  { fromCode: "BRSR", toCode: "GRI", type: "ALIGNS_WITH" },
  { fromCode: "BRSR", toCode: "IFRS-S1S2", type: "ALIGNS_WITH" },
  { fromCode: "EU-ROHS", toCode: "EU-REACH", type: "ALIGNS_WITH", note: "Both regulate hazardous substances; scopes differ." },
  { fromCode: "EU-WEEE", toCode: "EU-ROHS", type: "ALIGNS_WITH" },
  { fromCode: "ISO-14001", toCode: "BRSR", type: "ALIGNS_WITH" },
  { fromCode: "ISO-9001", toCode: "BRSR", type: "ALIGNS_WITH" },
  { fromCode: "ISO-45001", toCode: "BRSR", type: "ALIGNS_WITH" },
];

async function upsertSchemeByCode(s: SeedScheme) {
  const existing = await prisma.scheme.findFirst({
    where: { code: s.code },
    select: { id: true },
  });

  if (existing) {
    await prisma.scheme.update({
      where: { id: existing.id },
      data: {
        code: s.code,
        title: s.title,
        category: s.category,
        tags: s.tags,
        mandatory: s.mandatory,
        // authority: s.authority ?? undefined,
        // url: s.url ?? undefined,
        // summary: s.summary ?? undefined,
      },
    });
    return existing.id;
  } else {
    const created = await prisma.scheme.create({
      data: {
        code: s.code,
        title: s.title,
        category: s.category,
        tags: s.tags,
        mandatory: s.mandatory,
        // authority: s.authority ?? undefined,
        // url: s.url ?? undefined,
        // summary: s.summary ?? undefined,
      },
      select: { id: true },
    });
    return created.id;
  }
}

async function createRelationsByCode() {
  // map code → id
  const all = await prisma.scheme.findMany({ select: { id: true, code: true } });
  const idByCode = new Map(all.map((x) => [x.code, x.id]));

  for (const r of relationsSeed) {
    const fromId = idByCode.get(r.fromCode);
    const toId = idByCode.get(r.toCode);
    if (!fromId || !toId) {
      console.warn(`⚠️  Skipping relation: could not resolve ${r.fromCode} or ${r.toCode}`);
      continue;
    }

    const exists = await prisma.relation.findFirst({
      where: { fromId, toId, type: r.type },
      select: { id: true },
    });
    if (exists) continue;

    await prisma.relation.create({
      data: {
        fromId,
        toId,
        type: r.type,
        note: r.note ?? null,
      },
    });
  }
}

async function main() {
  console.log("🌱 Seeding schemes (by code) …");
  for (const s of schemesSeed) {
    await upsertSchemeByCode(s);
  }

  console.log("🔗 Seeding explicit relations …");
  await createRelationsByCode();

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
