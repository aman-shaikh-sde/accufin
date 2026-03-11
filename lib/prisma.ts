import { PrismaClient } from "./generated/prisma";

const globalAny = globalThis as any;

if (!globalAny.__accufinPrisma) {
  globalAny.__accufinPrisma = new PrismaClient({
    log: ["error", "warn"],
  });
}

export const prisma = globalAny.__accufinPrisma as PrismaClient;
export default prisma;