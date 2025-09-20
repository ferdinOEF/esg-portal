-- CreateEnum
CREATE TYPE "public"."RelationType" AS ENUM ('REQUIRES', 'ALIGNS_WITH', 'CONFLICTS_WITH');

-- CreateTable
CREATE TABLE "public"."Relation" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "type" "public"."RelationType" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Relation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Relation_fromId_idx" ON "public"."Relation"("fromId");

-- CreateIndex
CREATE INDEX "Relation_toId_idx" ON "public"."Relation"("toId");

-- AddForeignKey
ALTER TABLE "public"."Relation" ADD CONSTRAINT "Relation_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "public"."Scheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Relation" ADD CONSTRAINT "Relation_toId_fkey" FOREIGN KEY ("toId") REFERENCES "public"."Scheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;
