import { prisma } from "@/lib/prisma";
import type { PaymentMethod, PaymentStatus } from "@/generated/prisma/enums";
import type { PaymentWhereInput } from "@/generated/prisma/models/Payment";

export type PaymentDto = {
  id: number;
  orderId: number;
  orderTotal: string;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: Date;
  clientEmail?: string;
};

/**
 * Lista pagos con filtros opcionales (orderId, method).
 */
export async function listPayments(filters?: {
  orderId?: number;
  method?: PaymentMethod;
}): Promise<PaymentDto[]> {
  const where: PaymentWhereInput = {};
  if (filters?.orderId != null) where.orderId = filters.orderId;
  if (filters?.method != null) where.method = filters.method;

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { order: { select: { total: true, client: { select: { email: true } } } } },
  });

  return payments.map((p) => ({
    id: p.id,
    orderId: p.orderId,
    orderTotal: String(p.order.total),
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
    include: { order: { select: { total: true, client: { select: { email: true } } } } },
  });
  if (!payment) return null;
  return {
    id: payment.id,
    orderId: payment.orderId,
    orderTotal: String(payment.order.total),
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
export async function createPayment(data: {
  orderId: number;
  amount: number;
  method: PaymentMethod;
  status?: PaymentStatus;
}): Promise<PaymentDto> {
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
    include: { order: { select: { total: true, client: { select: { email: true } } } } },
  });
  return {
    id: payment.id,
    orderId: payment.orderId,
    orderTotal: String(payment.order.total),
    amount: String(payment.amount),
    method: payment.method,
    status: payment.status,
    createdAt: payment.createdAt,
    clientEmail: payment.order.client.email,
  };
}
