import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/requireAdmin";
import { getOrderById, updateOrderStatus } from "@/lib/services/order.service";
import type { OrderStatus } from "@/generated/prisma/enums";

const VALID_STATUSES: OrderStatus[] = [
  "CONFIRMADO",
  "EN_PREPARACION",
  "LISTO",
  "ENTREGADO",
  "CANCELADO",
];

/**
 * GET /api/v1/orders/[id] — Detalle de un pedido. ADMIN o CAJERO (el cajero solo
 * puede ver pedidos de su propio negocio).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (Number.isNaN(orderId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const order = await getOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  if (user.role === "CAJERO" && order.businessId !== user.workBusinessId) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  return NextResponse.json({ order });
}

/**
 * PATCH /api/v1/orders/[id] — Actualiza estado del pedido. ADMIN o CAJERO (el
 * cajero solo puede actualizar pedidos de su propio negocio).
 * Body: { status: OrderStatus }
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (Number.isNaN(orderId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const existing = await getOrderById(orderId);
  if (!existing) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }
  if (user.role === "CAJERO" && existing.businessId !== user.workBusinessId) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const status = body.status as OrderStatus | undefined;
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Estado inválido. Use: CONFIRMADO, EN_PREPARACION, LISTO, ENTREGADO, CANCELADO" },
      { status: 400 }
    );
  }

  const order = await updateOrderStatus(orderId, status, user.id);
  if (!order) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }

  return NextResponse.json({ order });
}
