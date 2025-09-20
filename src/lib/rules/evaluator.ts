// src/lib/rules/evaluator.ts
import type { Company, Scheme } from "@prisma/client";

export type Suggestion = {
  scheme: Scheme;
  reason: string;
  mandatory: boolean;
  score: number; // 0-100
};

// Tiny helpers
const hasTag = (s: Scheme, tag: string) => (s.tags || []).map(t => t.toLowerCase()).includes(tag.toLowerCase());
const catHas = (s: Scheme, needle: string) => (s.category || "").toLowerCase().includes(needle.toLowerCase());

// Very simple scoring + reasons based on common ESG cases you care about.
// Extend as needed; this is enough to start delivering value.
export function evaluateCompany(company: Company, schemes: Scheme[]): Suggestion[] {
  const out: Suggestion[] = [];
  const companyTags = (company.tags || []).map(t => t.toLowerCase());
  const isGoa = companyTags.includes("goa") || companyTags.includes("in-ga") || companyTags.includes("crz");
  const isExporter = !!company.export;

  for (const scheme of schemes) {
    let score = 0;
    let mandatory = false;
    const reasons: string[] = [];

    // Jurisdiction hints via tags/category
    const isEU = hasTag(scheme, "eu") || catHas(scheme, "(eu)");
    const isIndia = hasTag(scheme, "india") || catHas(scheme, "(india)");
    const isGoaTagged = hasTag(scheme, "goa") || catHas(scheme, "goa") || catHas(scheme, "coastal/crz");

    // 1) Export-driven (e.g., CBAM, EU directives)
    if (isExporter && isEU) {
      score += 40;
      reasons.push("Exports → EU applicability");
      if (hasTag(scheme, "cbam") || catHas(scheme, "trade & carbon")) {
        score += 25;
        reasons.push("Trade & carbon mechanism likely relevant (CBAM family)");
      }
    }

    // 2) Goa / CRZ
    if (isIndia && isGoa && isGoaTagged) {
      score += 45;
      reasons.push("Goa / CRZ presence → coastal & state regulations apply");
      mandatory = true;
    }

    // 3) EPR quick checks (producer/importer/brand owner markers via tags)
    if (isIndia && (companyTags.includes("producer") || companyTags.includes("brandowner") || companyTags.includes("importer"))) {
      if (hasTag(scheme, "epr") || catHas(scheme, "epr")) {
        score += 40;
        reasons.push("Producer/Importer/Brand Owner → EPR obligations");
        mandatory = true;
      }
    }

    // 4) Manufacturing operations hints (basic)
    if (companyTags.includes("manufacturing")) {
      if (catHas(scheme, "management systems (iso)")) {
        score += 20;
        reasons.push("Manufacturing → ISO management systems beneficial");
      }
      if (catHas(scheme, "product compliance") || hasTag(scheme, "bis") || hasTag(scheme, "ce")) {
        score += 20;
        reasons.push("Manufacturing → product compliance likely needed");
      }
    }

    // 5) Disclosure / buyer requirements (if company tagged by buyers: cdp/gri/ifrs)
    if (companyTags.includes("cdp") || companyTags.includes("gri") || companyTags.includes("ifrs")) {
      if (catHas(scheme, "disclosure") || hasTag(scheme, "disclosure")) {
        score += 25;
        reasons.push("Buyer requirements → disclosure frameworks relevant");
      }
    }

    // Mandatory bit from scheme itself
    if (scheme.mandatory) {
      // Slight bump because mandatory schemes rank higher
      score += 10;
    }

    if (score > 0) {
      out.push({
        scheme,
        reason: reasons.length ? reasons.join("; ") : "Potentially relevant",
        mandatory: scheme.mandatory || mandatory,
        score: Math.min(100, score),
      });
    }
  }

  // Sort: mandatory first, then score desc, then title
  return out.sort((a, b) => {
    if (a.mandatory !== b.mandatory) return a.mandatory ? -1 : 1;
    if (b.score !== a.score) return b.score - a.score;
    return a.scheme.title.localeCompare(b.scheme.title);
  });
}
