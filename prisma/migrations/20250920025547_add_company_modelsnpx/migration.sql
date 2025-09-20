/*
  Warnings:

  - You are about to drop the column `abn` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Company" DROP COLUMN "abn",
DROP COLUMN "address",
DROP COLUMN "phone",
DROP COLUMN "website",
ADD COLUMN     "employees" INTEGER,
ADD COLUMN     "export" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "exportRegions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "revenueBand" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "public"."CompanyScheme" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'suggested',
    "notes" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyScheme_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."CompanyScheme" ADD CONSTRAINT "CompanyScheme_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompanyScheme" ADD CONSTRAINT "CompanyScheme_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "public"."Scheme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
