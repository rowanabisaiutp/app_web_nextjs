import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { findUserById } from "@/lib/services/auth.service";
import { getOrderById, updateOrderStatus } from "@/lib/services/order.service";
import type { OrderStatus } from "@/generated/prisma/enums";

const VALID_STATUSES: OrderStatus[] = [
  "CONFIRMADO",
  "EN_PREPARACION",
  "LISTO",
  "ENTREGADO",
  "CANCELADO",
];

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;

  if (!token) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }), user: null };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return { error: NextResponse.json({ error: "Sesión inválida" }, { status: 401 }), user: null };
  }

  const user = await findUserById(payload.userId);
  if (!user || user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Sin permiso" }, { status: 403 }), user: null };
  }

  return { error: null, user };
}

/**
 * GET /api/admin/orders/[id] — Detalle de un pedido. Solo ADMIN.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
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

  return NextResponse.json({ order });
}

/**
 * PATCH /api/admin/orders/[id] — Actualiza estado del pedido. Solo ADMIN.
 * Body: { status: OrderStatus }
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (Number.isNaN(orderId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
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

  const order = await updateOrderStatus(orderId, status);
  if (!order) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }

  return NextResponse.json({ order });
}
