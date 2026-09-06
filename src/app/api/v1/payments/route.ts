import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/requireAdmin";
import { listPayments, createPayment } from "@/lib/services/payment.service";
import { getOrderById } from "@/lib/services/order.service";
import type { PaymentMethod, PaymentStatus } from "@/generated/prisma/enums";

/**
 * GET /api/v1/payments — Lista pagos. ADMIN ve todos. CAJERO solo ve pagos de
 * pedidos de su propio negocio (workBusinessId).
 * Query: orderId, method (EFECTIVO | TARJETA)
 */
export async function GET(req: Request) {
  const { error, user } = await requireAuth();
  if (error) return error;

  if (user.role === "CAJERO" && user.workBusinessId == null) {
    return NextResponse.json({ payments: [] });
  }

  const { searchParams } = new URL(req.url);
  const orderIdParam = searchParams.get("orderId");
  const method = searchParams.get("method") as PaymentMethod | null;
  const orderId = orderIdParam ? parseInt(orderIdParam, 10) : undefined;
  const payments = await listPayments({
    orderId: orderId != null && !Number.isNaN(orderId) ? orderId : undefined,
    method: method === "EFECTIVO" || method === "TARJETA" ? method : undefined,
    businessId: user.role === "CAJERO" ? user.workBusinessId! : undefined,
  });
  return NextResponse.json({ payments });
}

/**
 * POST /api/v1/payments — Registra un pago. ADMIN o CAJERO (el cajero solo
 * puede registrar pagos para pedidos de su propio negocio).
 * Body: { orderId, amount, method }
 */
export async function POST(req: Request) {
  const { error, user } = await requireAuth();
  if (error) return error;
  let body: { orderId?: number; amount?: number; method?: PaymentMethod; status?: PaymentStatus };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const orderId = body.orderId;
  const amount = body.amount;
  const method = body.method;
  if (orderId == null || typeof orderId !== "number") return NextResponse.json({ error: "orderId requerido" }, { status: 400 });
  if (amount == null || typeof amount !== "number" || amount <= 0) return NextResponse.json({ error: "Monto inválido (debe ser > 0)" }, { status: 400 });
  if (method !== "EFECTIVO" && method !== "TARJETA") return NextResponse.json({ error: "Método debe ser EFECTIVO o TARJETA" }, { status: 400 });

  if (user.role === "CAJERO") {
    const order = await getOrderById(orderId);
    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    if (order.businessId !== user.workBusinessId) {
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    }
  }

  try {
    const payment = await createPayment({ orderId, amount, method, status: body.status }, user.id);
    return NextResponse.json({ payment });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al registrar pago";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
