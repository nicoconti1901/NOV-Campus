import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaSqliteReady: boolean | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/** SQLite: WAL + busy_timeout reducen bloqueos bajo next dev / lecturas concurrentes. */
if (!globalForPrisma.prismaSqliteReady) {
  globalForPrisma.prismaSqliteReady = true;
  void (async () => {
    try {
      await prisma.$executeRawUnsafe("PRAGMA journal_mode=WAL;");
      await prisma.$executeRawUnsafe("PRAGMA busy_timeout=5000;");
      await prisma.$executeRawUnsafe("PRAGMA synchronous=NORMAL;");
    } catch {
      // No-op si el provider no es SQLite o el archivo aún no existe.
    }
  })();
}
