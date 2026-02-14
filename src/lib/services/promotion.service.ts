import { prisma } from "@/lib/prisma";
import type { PromotionType, DiscountType } from "@/generated/prisma/enums";

export type PromotionDto = {
  id: number;
  type: PromotionType;
  code: string | null;
  discountType: DiscountType | null;
  value: string | null;
  validUntil: Date | null;
  maxUses: number | null;
  usedCount: number;
  name: string | null;
  description: string | null;
  timeStart: string | null;
  timeEnd: string | null;
  active: boolean;
  createdAt: Date;
};

/**
 * Lista promociones con filtro opcional por tipo (COUPON | TIME).
 */
export async function listPromotions(filters?: {
  type?: PromotionType;
}): Promise<PromotionDto[]> {
  const where: Parameters<typeof prisma.promotion.findMany>[0]["where"] = {};
  if (filters?.type) where.type = filters.type;

  const list = await prisma.promotion.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return list.map((p) => ({
    id: p.id,
    type: p.type,
    code: p.code ?? null,
    discountType: p.discountType ?? null,
    value: p.value != null ? String(p.value) : null,
    validUntil: p.validUntil ?? null,
    maxUses: p.maxUses ?? null,
    usedCount: p.usedCount,
    name: p.name ?? null,
    description: p.description ?? null,
    timeStart: p.timeStart ?? null,
    timeEnd: p.timeEnd ?? null,
    active: p.active,
    createdAt: p.createdAt,
  }));
}

/**
 * Obtiene una promoción por id.
 */
export async function getPromotionById(id: number): Promise<PromotionDto | null> {
  const p = await prisma.promotion.findUnique({ where: { id } });
  if (!p) return null;
  return {
    id: p.id,
    type: p.type,
    code: p.code ?? null,
    discountType: p.discountType ?? null,
    value: p.value != null ? String(p.value) : null,
    validUntil: p.validUntil ?? null,
    maxUses: p.maxUses ?? null,
    usedCount: p.usedCount,
    name: p.name ?? null,
    description: p.description ?? null,
    timeStart: p.timeStart ?? null,
    timeEnd: p.timeEnd ?? null,
    active: p.active,
    createdAt: p.createdAt,
  };
}

export type CreatePromotionInput = {
  type: PromotionType;
  code?: string | null;
  discountType?: DiscountType | null;
  value?: number | null;
  validUntil?: Date | string | null;
  maxUses?: number | null;
  name?: string | null;
  description?: string | null;
  timeStart?: string | null;
  timeEnd?: string | null;
  active?: boolean;
};

/**
 * Crea una promoción (cupón o por tiempo).
 */
export async function createPromotion(data: CreatePromotionInput): Promise<PromotionDto> {
  if (data.type === "COUPON" && !data.code?.trim()) {
    throw new Error("El código es obligatorio para cupones.");
  }
  const validUntil =
    data.validUntil != null
      ? typeof data.validUntil === "string"
        ? new Date(data.validUntil)
        : data.validUntil
      : null;

  const p = await prisma.promotion.create({
    data: {
      type: data.type,
      code: data.code?.trim() || null,
      discountType: data.discountType ?? null,
      value: data.value != null ? data.value : null,
      validUntil: validUntil ?? undefined,
      maxUses: data.maxUses ?? null,
      name: data.name?.trim() || null,
      description: data.description?.trim() || null,
      timeStart: data.timeStart?.trim() || null,
      timeEnd: data.timeEnd?.trim() || null,
      active: data.active ?? true,
    },
  });

  return {
    id: p.id,
    type: p.type,
    code: p.code ?? null,
    discountType: p.discountType ?? null,
    value: p.value != null ? String(p.value) : null,
    validUntil: p.validUntil ?? null,
    maxUses: p.maxUses ?? null,
    usedCount: p.usedCount,
    name: p.name ?? null,
    description: p.description ?? null,
    timeStart: p.timeStart ?? null,
    timeEnd: p.timeEnd ?? null,
    active: p.active,
    createdAt: p.createdAt,
  };
}

export type UpdatePromotionInput = Partial<Omit<CreatePromotionInput, "type">>;

/**
 * Actualiza una promoción.
 */
export async function updatePromotion(
  id: number,
  data: UpdatePromotionInput
): Promise<PromotionDto | null> {
  const existing = await prisma.promotion.findUnique({ where: { id } });
  if (!existing) return null;

  if (existing.type === "COUPON" && data.code !== undefined && !data.code?.trim()) {
    throw new Error("El código no puede quedar vacío para cupones.");
  }

  const validUntil =
    data.validUntil !== undefined
      ? data.validUntil != null
        ? typeof data.validUntil === "string"
          ? new Date(data.validUntil)
          : data.validUntil
        : null
      : undefined;

  const p = await prisma.promotion.update({
    where: { id },
    data: {
      ...(data.code !== undefined && { code: data.code?.trim() || null }),
      ...(data.discountType !== undefined && { discountType: data.discountType ?? null }),
      ...(data.value !== undefined && { value: data.value != null ? data.value : null }),
      ...(data.validUntil !== undefined && { validUntil: validUntil ?? null }),
      ...(data.maxUses !== undefined && { maxUses: data.maxUses ?? null }),
      ...(data.name !== undefined && { name: data.name?.trim() || null }),
      ...(data.description !== undefined && { description: data.description?.trim() || null }),
      ...(data.timeStart !== undefined && { timeStart: data.timeStart?.trim() || null }),
      ...(data.timeEnd !== undefined && { timeEnd: data.timeEnd?.trim() || null }),
      ...(data.active !== undefined && { active: data.active }),
    },
  });

  return {
    id: p.id,
    type: p.type,
    code: p.code ?? null,
    discountType: p.discountType ?? null,
    value: p.value != null ? String(p.value) : null,
    validUntil: p.validUntil ?? null,
    maxUses: p.maxUses ?? null,
    usedCount: p.usedCount,
    name: p.name ?? null,
    description: p.description ?? null,
    timeStart: p.timeStart ?? null,
    timeEnd: p.timeEnd ?? null,
    active: p.active,
    createdAt: p.createdAt,
  };
}

/**
 * Elimina una promoción.
 */
export async function deletePromotion(id: number): Promise<void> {
  await prisma.promotion.delete({ where: { id } });
}
