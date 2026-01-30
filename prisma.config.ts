import "dotenv/config";
import { defineConfig } from "prisma/config";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const db = process.env.DB_NAME;
  const port = process.env.DB_PORT ?? "3306";

  if (!host || !user || !password || !db) {
    throw new Error(
      "Faltan variables. Define DATABASE_URL o DB_HOST, DB_USER, DB_PASSWORD, DB_NAME en .env"
    );
  }
  return `mysql://${user}:${encodeURIComponent(password)}@${host}:${port}/${db}`;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: getDatabaseUrl(),
  },
});
