// src/lib/prisma.ts
//
// Prisma client singleton with safe reuse in dev (HMR) and serverless.
// Works with Next.js App Router (runtime: "nodejs") and Neon on Vercel.
//
// Usage:
//   import { prisma } from "@/src/lib/prisma";
//   // or: import prisma from "@/src/lib/prisma";

import { PrismaClient } from "@prisma/client";

// Augment the Node global type to hold our Prisma instance in dev
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Create (or reuse) a single PrismaClient instance
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"], // keep logs light; add "query" if you need debugging
    datasources: {
      // respect DATABASE_URL; useful if you dynamically change it in tests
      db: { url: process.env.DATABASE_URL },
    },
  });

// In dev, store the client on the global object to preserve it across HMR reloads.
// In production (Vercel), each lambda may create its own instance; that's fine.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
