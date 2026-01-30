/**
 * Carga .env, construye DATABASE_URL desde DB_* si no existe, y ejecuta el comando Prisma.
 * Uso: node scripts/with-db-url.cjs prisma db push
 */
const path = require("path");
const { spawnSync } = require("child_process");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

if (!process.env.DATABASE_URL) {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const db = process.env.DB_NAME;
  const port = process.env.DB_PORT || "3306";
  if (host && user && password && db) {
    process.env.DATABASE_URL = `mysql://${user}:${encodeURIComponent(password)}@${host}:${port}/${db}`;
  }
}

const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error("Uso: node scripts/with-db-url.cjs prisma <comando>");
  process.exit(1);
}

const result = spawnSync("npx", [cmd, ...args], {
  stdio: "inherit",
  env: process.env,
  shell: true,
});
process.exit(result.status ?? 1);
