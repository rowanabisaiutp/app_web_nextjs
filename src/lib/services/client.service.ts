import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { ClientWhereInput } from "@/generated/prisma/models/Client";

const SALT_ROUNDS = 12;

export type ClientDto = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  blocked: boolean;
  createdAt: Date;
  ordersCount: number;
};

export type ClientDetailDto = ClientDto & {};

function toClientDto(
  row: {
    id: number;
    email: string;
    name: string | null;
    phone: string | null;
    address: string | null;
    blocked: boolean;
    createdAt: Date;
  },
  ordersCount: number
): ClientDto {
  return {
    id: row.id,
    email: row.email,
    name: row.name ?? null,
    phone: row.phone ?? null,
    address: row.address ?? null,
    blocked: row.blocked,
    createdAt: row.createdAt,
    ordersCount,
  };
}

/**
 * Lista clientes con búsqueda opcional por nombre o email.
 */
export async function listClients(search?: string): Promise<ClientDto[]> {
  const where: ClientWhereInput = {};
  if (search?.trim()) {
    const q = search.trim();
    where.OR = [
      { email: { contains: q } },
      { name: { contains: q } },
    ];
  }

  const clients = await prisma.client.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
    },
  });

  return clients.map((c) => toClientDto(c, c._count.orders));
}

/**
 * Obtiene un cliente por id (sin passwordHash).
 */
export async function getClientById(id: number): Promise<ClientDto | null> {
  const client = await prisma.client.findUnique({
    where: { id },
    include: { _count: { select: { orders: true } } },
  });
  if (!client) return null;
  return toClientDto(client, client._count.orders);
}

/**
 * Crea un cliente. El email debe ser único.
 */
export async function createClient(data: {
  email: string;
  password: string;
  name?: string | null;
  phone?: string | null;
  address?: string | null;
}): Promise<ClientDto> {
  const email = data.email.trim().toLowerCase();
  const existing = await prisma.client.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Ya existe un cliente con ese email");
  }
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const client = await prisma.client.create({
    data: {
      email,
      passwordHash,
      name: data.name?.trim() || null,
      phone: data.phone?.trim() || null,
      address: data.address?.trim() || null,
    },
  });
  return toClientDto(client, 0);
}

/**
 * Actualiza datos del cliente (nombre, teléfono, dirección, bloqueado).
 */
export async function updateClient(
  id: number,
  data: {
    name?: string | null;
    phone?: string | null;
    address?: string | null;
    blocked?: boolean;
  }
): Promise<ClientDto | null> {
  const client = await prisma.client.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name?.trim() || null }),
      ...(data.phone !== undefined && { phone: data.phone?.trim() || null }),
      ...(data.address !== undefined && { address: data.address?.trim() || null }),
      ...(data.blocked !== undefined && { blocked: data.blocked }),
    },
    include: { _count: { select: { orders: true } } },
  });
  return toClientDto(client, client._count.orders);
}

/**
 * Elimina un cliente. Falla si tiene pedidos (Restrict).
 */
export async function deleteClient(id: number): Promise<void> {
  await prisma.client.delete({ where: { id } });
}
