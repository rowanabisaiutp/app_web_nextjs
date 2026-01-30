import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { findUserById } from "@/lib/services/auth.service";
import { listOrders } from "@/lib/services/order.service";
import type { OrderStatus } from "@/generated/prisma/enums";

/**
 * GET /api/admin/orders — Lista pedidos. Solo ADMIN.
 * Query: status (CONFIRMADO | EN_PREPARACION | LISTO | ENTREGADO | CANCELADO | todos), search (cliente o número)
 */
export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }

  const currentUser = await findUserById(payload.userId);
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as OrderStatus | "todos" | null;
  const search = searchParams.get("search") ?? undefined;

  const orders = await listOrders({
    status: status && status !== "" ? status : "todos",
    search,
  });

  return NextResponse.json({ orders });
}
