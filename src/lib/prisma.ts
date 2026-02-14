import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

type DbConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

function getDbConfig(): DbConfig {
  if (
    process.env.DB_HOST &&
    process.env.DB_USER &&
    process.env.DB_PASSWORD &&
    process.env.DB_NAME
  ) {
    return {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };
  }

  const url = process.env.DATABASE_URL;
  if (url) {
    const match = url.match(
      /^mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+?)(?:\?|$)/
    );
    if (match) {
      const [, user, password, host, portStr, database] = match;
      return {
        host,
        port: Number(portStr) || 3306,
        user,
        password: decodeURIComponent(password),
        database,
      };
    }
  }

  throw new Error(
    "Faltan variables de DB. Define DATABASE_URL o DB_HOST, DB_USER, DB_PASSWORD, DB_NAME en .env"
  );
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const config = getDbConfig();
  const adapter = new PrismaMariaDb({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    connectionLimit: 10,
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
