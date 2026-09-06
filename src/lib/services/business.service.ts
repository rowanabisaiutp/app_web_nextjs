import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/services/auditLog.service";

export type BusinessDto = {
  id: number;
  userId: number;
  name: string;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  createdAt: Date;
};

function toDto(row: {
  id: number;
  userId: number;
  name: string;
  address: string | null;
  latitude: unknown;
  longitude: unknown;
  createdAt: Date;
}): BusinessDto {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    address: row.address,
    latitude: row.latitude != null ? String(row.latitude) : null,
    longitude: row.longitude != null ? String(row.longitude) : null,
    createdAt: row.createdAt,
  };
}

export async function listBusinessesByUser(userId: number): Promise<BusinessDto[]> {
  const rows = await prisma.business.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toDto);
}

export type CreateBusinessInput = {
  userId: number;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export async function createBusiness(input: CreateBusinessInput): Promise<BusinessDto> {
  const row = await prisma.business.create({
    data: {
      userId: input.userId,
      name: input.name,
      address: input.address ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
    },
  });

  await createAuditLog({
    userId: input.userId,
    action: "Crear negocio",
    resourceType: "Business",
    resourceId: row.id,
    detail: row.name,
    logType: "ACTION",
  });

  return toDto(row);
}

export async function deleteBusiness(id: number, userId: number): Promise<boolean> {
  const result = await prisma.business.deleteMany({ where: { id, userId } });
  const deleted = result.count > 0;

  if (deleted) {
    await createAuditLog({
      userId,
      action: "Eliminar negocio",
      resourceType: "Business",
      resourceId: id,
      logType: "ACTION",
    });
  }

  return deleted;
}
