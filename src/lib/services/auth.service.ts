import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const SALT_ROUNDS = 12;

export type UserSafe = {
  id: number;
  email: string;
  name: string | null;
  role: string;
};

/**
 * Busca un usuario admin por email (para login).
 */
export async function findUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return prisma.user.findUnique({
    where: { email: normalized },
  });
}

/**
 * Busca un usuario por id (para sesión /me).
 */
export async function findUserById(id: number): Promise<UserSafe | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true },
  });
  return user;
}

/**
 * Comprueba que la contraseña en texto plano coincida con el hash.
 */
export async function validatePassword(plainPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}

/**
 * Crea un usuario admin (registro). Hashea la contraseña y guarda en DB.
 */
export async function createAdminUser(data: {
  email: string;
  password: string;
  name?: string | null;
}): Promise<UserSafe> {
  const normalizedEmail = data.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      name: data.name?.trim() || null,
      role: "ADMIN",
    },
    select: { id: true, email: true, name: true, role: true },
  });

  return user;
}

export type UserWithCreatedAt = UserSafe & { createdAt: Date };

/**
 * Lista todos los usuarios del panel (para la sección Autenticación y roles).
 */
export async function listUsers(): Promise<UserWithCreatedAt[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  return users;
}

/**
 * Actualiza nombre y/o rol de un usuario.
 */
export async function updateUser(
  id: number,
  data: { name?: string | null; role?: "ADMIN" }
): Promise<UserSafe | null> {
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name?.trim() || null }),
      ...(data.role !== undefined && { role: data.role }),
    },
    select: { id: true, email: true, name: true, role: true },
  });
  return user;
}

/**
 * Elimina un usuario del panel.
 */
export async function deleteUser(id: number): Promise<void> {
  await prisma.user.delete({ where: { id } });
}
