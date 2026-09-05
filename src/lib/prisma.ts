import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = process.env.DB_PORT ?? "5432";

  if (!host || !user || !password || !database) {
    throw new Error(
      "Faltan variables de DB. Define DATABASE_URL o DB_HOST, DB_USER, DB_PASSWORD, DB_NAME en .env"
    );
  }
  return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const adapter = new PrismaPg({
    connectionString: getConnectionString(),
    max: 10,
    // rejectUnauthorized: true fue probado y falla contra el pooler de Supabase
    // (Supavisor/pgbouncer) con "self-signed certificate in certificate chain" (Prisma P1011).
    // Se mantiene en false para no romper la conexión a la base de datos real.
    ssl: { rejectUnauthorized: false },
  });
  const client = new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

/** Cliente Prisma; se inicializa en el primer uso para no exigir DB en build. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop: string) {
    return (getPrismaClient() as unknown as Record<string, unknown>)[prop];
  },
});
