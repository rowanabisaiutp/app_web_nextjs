import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = process.env.DB_PORT ?? "5432";
  if (!host || !user || !password || !database) throw new Error("Faltan DB_* o DATABASE_URL en .env");
  return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

async function main() {
  const adapter = new PrismaPg({ connectionString: getConnectionString(), ssl: { rejectUnauthorized: false } });
  const prisma = new PrismaClient({ adapter });

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Define ADMIN_EMAIL y ADMIN_PASSWORD en .env para crear el primer admin.");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (existing) {
    console.log("El admin ya existe:", email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email: email.trim().toLowerCase(),
      passwordHash,
      name: "Admin",
      role: "ADMIN",
    },
  });

  console.log("Admin creado:", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
