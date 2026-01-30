/**
 * Construye DATABASE_URL desde tus variables DB_* (Clever Cloud / .env).
 * Prisma usa DATABASE_URL; si no está definida, la generamos desde DB_HOST, DB_USER, etc.
 */
function buildDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const db = process.env.DB_NAME;
  const port = process.env.DB_PORT ?? "3306";

  if (!host || !user || !password || !db) {
    throw new Error(
      "Faltan variables de DB. Define DATABASE_URL o DB_HOST, DB_USER, DB_PASSWORD, DB_NAME en .env"
    );
  }

  const encodedPassword = encodeURIComponent(password);
  return `mysql://${user}:${encodedPassword}@${host}:${port}/${db}`;
}

/**
 * Asegura que process.env.DATABASE_URL esté definida (desde DB_* si hace falta).
 * Llámala antes de usar Prisma.
 */
export function ensureDatabaseUrl(): string {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = buildDatabaseUrl();
  }
  return process.env.DATABASE_URL;
}
