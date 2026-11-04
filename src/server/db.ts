import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { closetPrisma?: PrismaClient };

/** Cliente do banco (papel `closet_app`). Null quando DATABASE_URL não está configurada neste ambiente. */
export function getDb(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  return (globalForPrisma.closetPrisma ??= new PrismaClient());
}
