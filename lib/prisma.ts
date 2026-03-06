import { PrismaClient } from "./generated/prisma";

const globalAny = globalThis as any;
if (!globalAny.__accufinGuardsInstalled) {
  globalAny.__accufinGuardsInstalled = true;
  process.on("uncaughtException", (err) => console.error("uncaughtException:", err));
  process.on("unhandledRejection", (err) => console.error("unhandledRejection:", err));
}

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: ["error", "warn"],
  });
  return client;
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;