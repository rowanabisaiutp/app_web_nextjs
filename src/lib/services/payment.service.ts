import { prisma } from "@/lib/prisma";
import type { PaymentMethod, PaymentStatus } from "@/generated/prisma/enums";
import type { PaymentWhereInput } from "@/generated/prisma/models/Payment";
import { createAuditLog } from "@/lib/services/auditLog.service";

export type PaymentDto = {
  id: number;
  orderId: number;
  orderTotal: string;
  businessId: number | null;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: Date;
  clientEmail?: string;
};

/**
 * Lista pagos con filtros opcionales (orderId, method, businessId).
 * `businessId` filtra por el negocio del pedido asociado (para CAJERO).
 */
export async function listPayments(filters?: {
  orderId?: number;
  method?: PaymentMethod;
  businessId?: number;
}): Promise<PaymentDto[]> {
  const where: PaymentWhereInput = {};
  if (filters?.orderId != null) where.orderId = filters.orderId;
  if (filters?.method != null) where.method = filters.method;
  if (filters?.businessId != null) where.order = { businessId: filters.businessId };

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      order: { select: { total: true, businessId: true, client: { select: { email: true } } } },
    },
  });

  return payments.map((p) => ({
    id: p.id,
    orderId: p.orderId,
    orderTotal: String(p.order.total),
    businessId: p.order.businessId,
    amount: String(p.amount),
    method: p.method,
    status: p.status,
    createdAt: p.createdAt,
    clientEmail: p.order.client.email,
  }));
}

/**
 * Obtiene un pago por id.
 */
export async function getPaymentById(id: number): Promise<PaymentDto | null> {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      order: { select: { total: true, businessId: true, client: { select: { email: true } } } },
    },
  });
  if (!payment) return null;
  return {
    id: payment.id,
    orderId: payment.orderId,
    orderTotal: String(payment.order.total),
    businessId: payment.order.businessId,
    amount: String(payment.amount),
    method: payment.method,
    status: payment.status,
    createdAt: payment.createdAt,
    clientEmail: payment.order.client.email,
  };
}

/**
 * Registra un pago para un pedido.
 */
export async function createPayment(
  data: {
    orderId: number;
    amount: number;
    method: PaymentMethod;
    status?: PaymentStatus;
  },
  actingUserId?: number | null
): Promise<PaymentDto> {
  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
    select: { id: true, total: true, client: { select: { email: true } } },
  });
  if (!order) throw new Error("Pedido no encontrado");
  if (data.amount <= 0) throw new Error("El monto debe ser mayor a 0");

  const payment = await prisma.payment.create({
    data: {
      orderId: data.orderId,
      amount: data.amount,
      method: data.method,
      status: data.status ?? "PAGADO",
    },
    include: {
      order: { select: { total: true, businessId: true, client: { select: { email: true } } } },
    },
  });

  await createAuditLog({
    userId: actingUserId ?? null,
    action: "Registrar pago",
    resourceType: "Payment",
    resourceId: payment.id,
    detail: `Pedido #${payment.orderId} — ${payment.method}`,
    logType: "ACTION",
  });

  return {
    id: payment.id,
    orderId: payment.orderId,
    orderTotal: String(payment.order.total),
    businessId: payment.order.businessId,
    amount: String(payment.amount),
    method: payment.method,
    status: payment.status,
    createdAt: payment.createdAt,
    clientEmail: payment.order.client.email,
  };
}
