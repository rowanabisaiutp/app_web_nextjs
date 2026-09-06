import { prisma } from "@/lib/prisma";
import type { OrderStatus, DeliveryType } from "@/generated/prisma/enums";
import type { OrderWhereInput } from "@/generated/prisma/models/Order";
import { createAuditLog } from "@/lib/services/auditLog.service";
import { createNotification } from "@/lib/services/notification.service";

export type OrderListItem = {
  id: number;
  clientId: number;
  clientName: string | null;
  clientEmail: string;
  businessId: number | null;
  status: string;
  total: string;
  deliveryType: string;
  deliveryAddress: string | null;
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

function toOrderItemDto(item: {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: unknown;
}): OrderItemDto {
  const unitPrice = Number(item.unitPrice);
  const subtotal = unitPrice * item.quantity;
  return {
    id: item.id,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: String(item.unitPrice),
    subtotal: subtotal.toFixed(2),
  };
}

function toOrderDetailDto(order: {
  id: number;
  clientId: number;
  client: { name: string | null; email: string };
  businessId: number | null;
  status: string;
  total: unknown;
  deliveryType: string;
  deliveryAddress: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{ id: number; productName: string; quantity: number; unitPrice: unknown }>;
}): OrderDetail {
  return {
    id: order.id,
    clientId: order.clientId,
    clientName: order.client.name ?? null,
    clientEmail: order.client.email,
    businessId: order.businessId,
    status: order.status,
    total: String(order.total),
    deliveryType: order.deliveryType,
    deliveryAddress: order.deliveryAddress ?? null,
    notes: order.notes ?? null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map(toOrderItemDto),
  };
}

/**
 * Lista pedidos con filtros opcionales (estado, tipo de entrega, búsqueda, clientId).
 */
export async function listOrders(filters?: {
  status?: OrderStatus | "todos";
  deliveryType?: "LOCAL" | "DOMICILIO" | "todos";
  search?: string;
  clientId?: number;
  businessId?: number;
}): Promise<OrderListItem[]> {
  const where: OrderWhereInput = {};

  if (filters?.status && filters.status !== "todos") {
    where.status = filters.status as OrderStatus;
  }

  if (filters?.deliveryType && filters.deliveryType !== "todos") {
    where.deliveryType = filters.deliveryType;
  }

  if (filters?.clientId != null) {
    where.clientId = filters.clientId;
  }

  if (filters?.businessId != null) {
    where.businessId = filters.businessId;
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
    businessId: o.businessId,
    status: o.status,
    total: String(o.total),
    deliveryType: o.deliveryType,
    deliveryAddress: o.deliveryAddress ?? null,
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

  return toOrderDetailDto(order);
}

/**
 * Actualiza el estado de un pedido.
 */
export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
  actingUserId?: number | null
): Promise<OrderDetail | null> {
  if (!VALID_STATUSES.includes(status)) {
    return null;
  }

  const existing = await prisma.order.findUnique({ where: { id }, select: { status: true } });
  if (!existing) return null;
  const oldStatus = existing.status;

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      client: { select: { id: true, name: true, email: true } },
      items: true,
    },
  });

  await createAuditLog({
    userId: actingUserId ?? null,
    action: "Cambio de estado",
    resourceType: "Order",
    resourceId: order.id,
    oldValue: oldStatus,
    newValue: status,
    logType: "STATE_CHANGE",
  });

  await createNotification({
    title: "Pedido actualizado",
    message: `Pedido #${order.id} cambió a ${status}`,
    type: "ORDER_STATUS_CHANGED",
    resourceType: "Order",
    resourceId: order.id,
  });

  return toOrderDetailDto(order);
}

/**
 * Crea un pedido con sus ítems. El precio de cada ítem se toma del producto
 * actual en BD (nunca del cliente) y el total se calcula a partir de esos precios.
 */
export async function createOrder(
  data: {
    clientId: number;
    items: { productId: number; quantity: number }[];
    deliveryType: DeliveryType;
    deliveryAddress?: string | null;
    notes?: string | null;
    businessId?: number | null;
  },
  actingUserId?: number | null
): Promise<OrderDetail> {
  if (!data.items || data.items.length === 0) {
    throw new Error("El pedido debe tener al menos un ítem");
  }

  const productIds = [...new Set(data.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const orderItemsData = data.items.map((item) => {
    if (item.quantity <= 0) throw new Error("La cantidad debe ser mayor a 0");
    const product = productMap.get(item.productId);
    if (!product) throw new Error(`Producto ${item.productId} no encontrado`);
    return {
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
    };
  });

  const total = orderItemsData.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0
  );

  const order = await prisma.order.create({
    data: {
      clientId: data.clientId,
      businessId: data.businessId ?? null,
      deliveryType: data.deliveryType,
      deliveryAddress: data.deliveryAddress ?? null,
      notes: data.notes ?? null,
      total,
      items: { create: orderItemsData },
    },
    include: {
      client: { select: { id: true, name: true, email: true } },
      items: true,
    },
  });

  await createAuditLog({
    userId: actingUserId ?? null,
    action: "Crear pedido",
    resourceType: "Order",
    resourceId: order.id,
    detail: `Pedido #${order.id} — S/ ${total.toFixed(2)}`,
    logType: "ACTION",
  });

  await createNotification({
    title: "Nuevo pedido",
    message: `Pedido #${order.id} creado — S/ ${total.toFixed(2)}`,
    type: "ORDER_CREATED",
    resourceType: "Order",
    resourceId: order.id,
  });

  return toOrderDetailDto(order);
}
