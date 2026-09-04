import "dotenv/config";
import { defineConfig } from "prisma/config";

// La CLI (db push / migrate / studio) necesita conexion de sesion, no el
// transaction-mode pooler que usa la app en runtime (src/lib/prisma.ts).
const migrationUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: migrationUrl,
  },
});
