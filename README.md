# ESG Portal (Starter Kit, v0.1.1 - fixed)

Next.js 14 + Prisma + Tailwind + NextAuth starter for an MSME ESG compliance portal.

## Quick Start

1. Copy `.env.example` to `.env` and fill values (Postgres + Auth secret).
2. Install deps: `pnpm i` or `npm i` or `yarn`.
3. Init DB: `npx prisma migrate dev --name init` then `npm run seed`.
4. Run: `npm run dev` and open http://localhost:3000

## Fixes vs previous
- Prisma relations corrected:
  - `Evidence.fileId` marked `@unique` for 1:1.
  - Back-relations on `User` for `uploadedBy` & `updatedBy`.
- NextAuth route export fixed using `handlers` destructure.
- GitHub provider configured with env vars.

## Next Steps
- Implement real file uploads (S3/R2).
- RBAC middleware by `Membership.role`.
- Assessment UI with status/score editing and reports.
