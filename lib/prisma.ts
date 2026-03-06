import { PrismaClient } from "./generated/prisma";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";

// Install one-time guards against unhandled errors and enforce a global fetch timeout
const globalAny = globalThis as any;
if (!globalAny.__accufinGuardsInstalled) {
  globalAny.__accufinGuardsInstalled = true;

  process.on("uncaughtException", (err) => {
    console.error("uncaughtException:", err);
  });
  process.on("unhandledRejection", (err) => {
    console.error("unhandledRejection:", err);
  });

  const DEFAULT_FETCH_TIMEOUT_MS = 10_000;
  const nativeFetch = globalAny.fetch?.bind(globalAny);
  if (nativeFetch) {
    globalAny.fetch = (resource: any, options: any = {}) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), DEFAULT_FETCH_TIMEOUT_MS);
      const opts = { ...options, signal: controller.signal };
      return nativeFetch(resource, opts).finally(() => clearTimeout(timer));
    };
  }
}

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL!;

  // The stateless HTTP adapter uses standard native fetch()
  // This completely eliminates hung WebSocket connections and idle TCP drops.
  const adapter = new PrismaNeonHTTP(connectionString, {
    fetchOptions: {
      cache: "no-store",
    },
  });

  const client = new PrismaClient({
    adapter,
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