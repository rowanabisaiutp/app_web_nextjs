import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function getConfig() {
  const url = process.env.DATABASE_URL;
  if (url) {
    const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (match) {
      const [, user, password, host, port, database] = match;
      return { host, port: Number(port), user, password: decodeURIComponent(password), database };
    }
  }
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = Number(process.env.DB_PORT) || 3306;
  if (!host || !user || !password || !database) throw new Error("Faltan DB_* o DATABASE_URL en .env");
  return { host, port, user, password, database };
}

async function main() {
  const config = getConfig();
  const adapter = new PrismaMariaDb(config);
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
