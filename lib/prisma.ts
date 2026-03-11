import { PrismaClient } from "./generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalAny = globalThis as any;

if (!globalAny.__accufinPrisma) {
  const adapter = new PrismaNeon({ 
    connectionString: process.env.DATABASE_URL! 
  });
  
  globalAny.__accufinPrisma = new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });
}

export const prisma = globalAny.__accufinPrisma as PrismaClient;
export default prisma;