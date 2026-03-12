// lib/prisma.ts

import { PrismaClient } from "./generated/prisma";

const PRISMA_KEY = Symbol.for("accufin.prisma");

type GlobalWithPrisma = typeof globalThis & {
  [PRISMA_KEY]?: PrismaClient;
};

const g = globalThis as GlobalWithPrisma;

if (!g[PRISMA_KEY]) {
  g[PRISMA_KEY] = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = g[PRISMA_KEY] as PrismaClient;
export default prisma;