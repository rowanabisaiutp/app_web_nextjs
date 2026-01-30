import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/enums";

export type OrderListItem = {
  id: number;
  clientId: number;
  clientName: string | null;
  clientEmail: string;
  status: string;
  total: string;
  deliveryType: string;
  createdAt: Date;
};

export type OrderItemDto = {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
};

export type OrderDetail = OrderListItem & {
  deliveryAddress: string | null;
  notes: string | null;
  items: OrderItemDto[];
  updatedAt: Date;
};

const VALID_STATUSES: OrderStatus[] = [
  "CONFIRMADO",
  "EN_PREPARACION",
  "LISTO",
  "ENTREGADO",
  "CANCELADO",
];

/**
 * Lista pedidos con filtros opcionales (estado, búsqueda por cliente/número).
 */
export async function listOrders(filters?: {
  status?: OrderStatus | "todos";
  search?: string;
}): Promise<OrderListItem[]> {
  const where: Parameters<typeof prisma.order.findMany>[0]["where"] = {};

  if (filters?.status && filters.status !== "todos") {
    where.status = filters.status as OrderStatus;
  }

  if (filters?.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      ...(!isNaN(Number(q)) ? [{ id: Number(q) }] : []),
      { client: { email: { contains: q } } },
      { client: { name: { contains: q } } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, name: true, email: true } },
    },
  });

  return orders.map((o) => ({
    id: o.id,
    clientId: o.clientId,
    clientName: o.client.name ?? null,
    clientEmail: o.client.email,
    status: o.status,
    total: String(o.total),
    deliveryType: o.deliveryType,
    createdAt: o.createdAt,
  }));
}

/**
 * Obtiene un pedido por id con ítems y cliente.
 */
export async function getOrderById(id: number): Promise<OrderDetail | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true } },
      items: true,
    },
  });

  if (!order) return null;

  const items: OrderItemDto[] = order.items.map((item) => {
    const unitPrice = Number(item.unitPrice);
    const subtotal = unitPrice * item.quantity;
    return {
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
      subtotal: subtotal.toFixed(2),
    };
  });

  return {
    id: order.id,
    clientId: order.clientId,
    clientName: order.client.name ?? null,
    clientEmail: order.client.email,
    status: order.status,
    total: String(order.total),
    deliveryType: order.deliveryType,
    deliveryAddress: order.deliveryAddress ?? null,
    notes: order.notes ?? null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items,
  };
}

/**
 * Actualiza el estado de un pedido.
 */
export async function updateOrderStatus(
  id: number,
  status: OrderStatus
): Promise<OrderDetail | null> {
  if (!VALID_STATUSES.includes(status)) {
    return null;
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      client: { select: { id: true, name: true, email: true } },
      items: true,
    },
  });

  const items: OrderItemDto[] = order.items.map((item) => {
    const unitPrice = Number(item.unitPrice);
    const subtotal = unitPrice * item.quantity;
    return {
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
      subtotal: subtotal.toFixed(2),
    };
  });

  return {
    id: order.id,
    clientId: order.clientId,
    clientName: order.client.name ?? null,
    clientEmail: order.client.email,
    status: order.status,
    total: String(order.total),
    deliveryType: order.deliveryType,
    deliveryAddress: order.deliveryAddress ?? null,
    notes: order.notes ?? null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items,
  };
}
