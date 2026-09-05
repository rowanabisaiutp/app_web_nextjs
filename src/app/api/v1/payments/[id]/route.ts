import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/requireAdmin";
import { getPaymentById } from "@/lib/services/payment.service";

/**
 * GET /api/v1/payments/[id] — Detalle de un pago
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const paymentId = parseInt(id, 10);
  if (Number.isNaN(paymentId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  const payment = await getPaymentById(paymentId);
  if (!payment) return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
  return NextResponse.json({ payment });
}
