export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { prisma } = await import("./lib/prisma");

    console.log("Starting Neon DB keep-alive...");

    setTimeout(() => {
      setInterval(async () => {
        try {
          await prisma.$queryRaw`SELECT 1`;
          console.log("DB keep-alive ping OK");
        } catch (err) {
          console.error("DB keep-alive ping failed:", err);
        }
      }, 2 * 60 * 1000);
    }, 30 * 1000);
  }
}