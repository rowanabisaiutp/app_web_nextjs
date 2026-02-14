import { prisma } from "@/lib/prisma";

export type ComboItemDto = {
  productId: number;
  quantity: number;
  productName?: string;
};

export type ComboDto = {
  id: number;
  name: string;
  price: string;
  active: boolean;
  items: ComboItemDto[];
  createdAt: Date;
};

/** Items en JSON: array de { productId, quantity } */
type ComboItemsJson = Array<{ productId: number; quantity: number }>;

/**
 * Lista todos los combos.
 */
export async function listCombos(): Promise<ComboDto[]> {
  const combos = await prisma.combo.findMany({
    orderBy: { name: "asc" },
  });

  const productIds = new Set<number>();
  combos.forEach((c) => {
    const items = (c.items as ComboItemsJson) ?? [];
    items.forEach((i) => productIds.add(i.productId));
  });

  const products =
    productIds.size > 0
      ? await prisma.product.findMany({
          where: { id: { in: Array.from(productIds) } },
          select: { id: true, name: true },
        })
      : [];
  const productMap = Object.fromEntries(products.map((p) => [p.id, p.name]));

  return combos.map((c) => {
    const items = ((c.items as ComboItemsJson) ?? []).map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      productName: productMap[i.productId] ?? `#${i.productId}`,
    }));
    return {
      id: c.id,
      name: c.name,
      price: String(c.price),
      active: c.active,
      items,
      createdAt: c.createdAt,
    };
  });
}

/**
 * Obtiene un combo por id.
 */
export async function getComboById(id: number): Promise<ComboDto | null> {
  const c = await prisma.combo.findUnique({ where: { id } });
  if (!c) return null;

  const items = (c.items as ComboItemsJson) ?? [];
  const productIds = items.map((i) => i.productId).filter((id) => id > 0);
  const products =
    productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: [...new Set(productIds)] } },
          select: { id: true, name: true },
        })
      : [];
  const productMap = Object.fromEntries(products.map((p) => [p.id, p.name]));

  const itemsDto: ComboItemDto[] = items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
    productName: productMap[i.productId] ?? `#${i.productId}`,
  }));

  return {
    id: c.id,
    name: c.name,
    price: String(c.price),
    active: c.active,
    items: itemsDto,
    createdAt: c.createdAt,
  };
}

export type CreateComboInput = {
  name: string;
  price: number;
  active?: boolean;
  items?: ComboItemDto[] | Array<{ productId: number; quantity: number }>;
};

/**
 * Crea un combo.
 */
export async function createCombo(data: CreateComboInput): Promise<ComboDto> {
  const itemsJson: ComboItemsJson = (data.items ?? []).map((i) => ({
    productId: i.productId,
    quantity: Math.max(1, i.quantity),
  }));

  const c = await prisma.combo.create({
    data: {
      name: data.name.trim(),
      price: data.price,
      active: data.active ?? true,
      items: itemsJson.length > 0 ? itemsJson : undefined,
    },
  });

  return getComboById(c.id) ?? {
    id: c.id,
    name: c.name,
    price: String(c.price),
    active: c.active,
    items: [],
    createdAt: c.createdAt,
  };
}

export type UpdateComboInput = {
  name?: string;
  price?: number;
  active?: boolean;
  items?: ComboItemDto[] | Array<{ productId: number; quantity: number }>;
};

/**
 * Actualiza un combo.
 */
export async function updateCombo(id: number, data: UpdateComboInput): Promise<ComboDto | null> {
  const existing = await prisma.combo.findUnique({ where: { id } });
  if (!existing) return null;

  const itemsJson: ComboItemsJson | undefined =
    data.items !== undefined
      ? data.items.map((i) => ({
          productId: i.productId,
          quantity: Math.max(1, i.quantity),
        }))
      : undefined;

  await prisma.combo.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.active !== undefined && { active: data.active }),
      ...(itemsJson !== undefined && { items: itemsJson }),
    },
  });

  return getComboById(id);
}

/**
 * Elimina un combo.
 */
export async function deleteCombo(id: number): Promise<void> {
  await prisma.combo.delete({ where: { id } });
}
