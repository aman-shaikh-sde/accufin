import { PrismaClient } from "./generated/prisma";

const globalAny = globalThis as any;

if (!globalAny.__accufinPrisma) {
  process.on("uncaughtException", (err) => console.error("uncaughtException:", err));
  process.on("unhandledRejection", (err) => console.error("unhandledRejection:", err));
  globalAny.__accufinPrisma = new PrismaClient({
    log: ["error", "warn"],
  });
}

export const prisma = globalAny.__accufinPrisma as PrismaClient;
export default prisma;