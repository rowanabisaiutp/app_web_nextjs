import { prisma } from "@/lib/prisma";

export type SettingsDto = {
  id: number;
  businessName: string;
  ruc: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  hoursJson: string | null;
  shippingCost: string | null;
  freeShippingFrom: string | null;
  igvPercent: string | null;
  pricesIncludeIgv: boolean;
};

/** Horarios por día: clave = día (lunes..domingo), valor = "HH:mm-HH:mm" o "Cerrado" */
export type HoursMap = Record<string, string>;

function toDto(row: {
  id: number;
  businessName: string;
  ruc: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  hoursJson: string | null;
  shippingCost: unknown;
  freeShippingFrom: unknown;
  igvPercent: unknown;
  pricesIncludeIgv: boolean;
}): SettingsDto {
  return {
    id: row.id,
    businessName: row.businessName,
    ruc: row.ruc,
    address: row.address,
    phone: row.phone,
    email: row.email,
    logoUrl: row.logoUrl,
    hoursJson: row.hoursJson,
    shippingCost: row.shippingCost != null ? String(row.shippingCost) : null,
    freeShippingFrom: row.freeShippingFrom != null ? String(row.freeShippingFrom) : null,
    igvPercent: row.igvPercent != null ? String(row.igvPercent) : null,
    pricesIncludeIgv: row.pricesIncludeIgv,
  };
}

/**
 * Obtiene la configuración del negocio (primer registro).
 * Si no existe, devuelve null.
 */
export async function getSettings(): Promise<SettingsDto | null> {
  const row = await prisma.settings.findFirst({ orderBy: { id: "asc" } });
  return row ? toDto(row) : null;
}

export type UpsertSettingsInput = {
  businessName?: string;
  ruc?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  hoursJson?: string | null;
  shippingCost?: number | null;
  freeShippingFrom?: number | null;
  igvPercent?: number | null;
  pricesIncludeIgv?: boolean;
};

/**
 * Crea o actualiza la configuración del negocio.
 * Si ya existe un registro, lo actualiza; si no, crea uno con nombre por defecto.
 */
export async function upsertSettings(input: UpsertSettingsInput): Promise<SettingsDto> {
  const existing = await prisma.settings.findFirst({ orderBy: { id: "asc" } });

  const data = {
    businessName: input.businessName ?? existing?.businessName ?? "Mi Negocio",
    ruc: input.ruc !== undefined ? input.ruc : existing?.ruc ?? null,
    address: input.address !== undefined ? input.address : existing?.address ?? null,
    phone: input.phone !== undefined ? input.phone : existing?.phone ?? null,
    email: input.email !== undefined ? input.email : existing?.email ?? null,
    logoUrl: input.logoUrl !== undefined ? input.logoUrl : existing?.logoUrl ?? null,
    hoursJson: input.hoursJson !== undefined ? input.hoursJson : existing?.hoursJson ?? null,
    shippingCost: input.shippingCost !== undefined ? input.shippingCost : existing?.shippingCost ?? null,
    freeShippingFrom: input.freeShippingFrom !== undefined ? input.freeShippingFrom : existing?.freeShippingFrom ?? null,
    igvPercent: input.igvPercent !== undefined ? input.igvPercent : existing?.igvPercent ?? null,
    pricesIncludeIgv: input.pricesIncludeIgv !== undefined ? input.pricesIncludeIgv : existing?.pricesIncludeIgv ?? true,
  };

  if (existing) {
    const row = await prisma.settings.update({
      where: { id: existing.id },
      data,
    });
    return toDto(row);
  }

  const row = await prisma.settings.create({ data });
  return toDto(row);
}
