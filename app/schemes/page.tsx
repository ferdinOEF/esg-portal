import { prisma } from "@/src/lib/prisma";
import SchemesClient from "@/components/schemes/SchemesClient";

export const revalidate = 300; // cacheable, low-churn list

export default async function SchemesPage() {
  const schemes = await prisma.scheme.findMany({
    select: {
      id: true,
      code: true,
      title: true,
      category: true,
      issuingAuthority: true,
      mandatory: true,
      description: true,
      eligibility: true,
      process: true,
      benefits: true,
      deadlines: true,
      features: true,
      tags: true,
      references: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });

  return <SchemesClient initialSchemes={schemes} />;
}
