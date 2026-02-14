import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { findUserById } from "@/lib/services/auth.service";
import { listPayments, createPayment } from "@/lib/services/payment.service";
import type { PaymentMethod, PaymentStatus } from "@/generated/prisma/enums";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;
  if (!token) return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  const payload = await verifyToken(token);
  if (!payload) return { error: NextResponse.json({ error: "Sesión inválida" }, { status: 401 }) };
  const user = await findUserById(payload.userId);
  if (!user || user.role !== "ADMIN") return { error: NextResponse.json({ error: "Sin permiso" }, { status: 403 }) };
  return { error: null };
}

/**
 * GET /api/v1/payments — Lista pagos. Query: orderId, method (EFECTIVO | TARJETA)
 */
export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const orderIdParam = searchParams.get("orderId");
  const method = searchParams.get("method") as PaymentMethod | null;
  const orderId = orderIdParam ? parseInt(orderIdParam, 10) : undefined;
  const payments = await listPayments({
    orderId: orderId != null && !Number.isNaN(orderId) ? orderId : undefined,
    method: method === "EFECTIVO" || method === "TARJETA" ? method : undefined,
  });
  return NextResponse.json({ payments });
}

/**
 * POST /api/v1/payments — Registra un pago. Body: { orderId, amount, method }
 */
export async function POST(req: Request) {
  const { error } = await requireAdmin();
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
  try {
    const payment = await createPayment({ orderId, amount, method, status: body.status });
    return NextResponse.json({ payment });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al registrar pago";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
