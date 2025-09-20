/*
  Warnings:

  - You are about to drop the column `score` on the `Assessment` table. All the data in the column will be lost.
  - The `status` column on the `Assessment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `note` on the `Evidence` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Evidence` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Evidence` table. All the data in the column will be lost.
  - You are about to drop the column `sizeBytes` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `storagePath` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Requirement` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Requirement` table. All the data in the column will be lost.
  - You are about to drop the column `frameworkId` on the `Requirement` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `Requirement` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hashedPassword` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Framework` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `Membership` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Requirement" DROP CONSTRAINT "Requirement_frameworkId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropIndex
DROP INDEX "public"."Assessment_companyId_requirementId_key";

-- DropIndex
DROP INDEX "public"."Evidence_fileId_key";

-- DropIndex
DROP INDEX "public"."Membership_userId_companyId_key";

-- DropIndex
DROP INDEX "public"."Requirement_frameworkId_code_key";

-- DropIndex
DROP INDEX "public"."Scheme_category_idx";

-- DropIndex
DROP INDEX "public"."Scheme_code_idx";

-- AlterTable
ALTER TABLE "public"."Assessment" DROP COLUMN "score",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."Evidence" DROP COLUMN "note",
DROP COLUMN "title",
DROP COLUMN "url";

-- AlterTable
ALTER TABLE "public"."File" DROP COLUMN "sizeBytes",
DROP COLUMN "storagePath",
ADD COLUMN     "size" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "url" TEXT,
ALTER COLUMN "mimeType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Membership" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Requirement" DROP COLUMN "category",
DROP COLUMN "code",
DROP COLUMN "frameworkId",
DROP COLUMN "weight",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "emailVerified",
DROP COLUMN "hashedPassword",
DROP COLUMN "image",
ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "public"."Account";

-- DropTable
DROP TABLE "public"."Framework";

-- DropTable
DROP TABLE "public"."Session";

-- DropEnum
DROP TYPE "public"."AssessmentStatus";

-- DropEnum
DROP TYPE "public"."Role";
