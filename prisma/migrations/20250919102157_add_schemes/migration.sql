-- CreateTable
CREATE TABLE "public"."Scheme" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "issuingAuthority" TEXT,
    "mandatory" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "eligibility" TEXT,
    "process" TEXT,
    "benefits" TEXT,
    "deadlines" TEXT,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "references" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scheme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Scheme_code_key" ON "public"."Scheme"("code");
