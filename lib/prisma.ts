// @ts-nocheck
import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client singleton
 * (evita múltiplas conexões no Next.js dev)
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

