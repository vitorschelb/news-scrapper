// ============================================================
// Prisma Client — Singleton
// ============================================================
// Por que: No Next.js/desenvolvimento, cada hot-reload criaria
// uma nova instância do PrismaClient. Esse singleton evita
// múltiplas conexões simultâneas durante o dev.
// ============================================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Em produção (Vercel), logs são desabilitados por segurança
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
