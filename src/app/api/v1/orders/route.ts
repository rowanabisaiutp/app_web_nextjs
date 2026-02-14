import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { findUserById } from "@/lib/services/auth.service";
import { listOrders } from "@/lib/services/order.service";
import type { OrderStatus } from "@/generated/prisma/enums";

/**
 * GET /api/v1/orders — Lista pedidos. Solo ADMIN.
 * Query: status, deliveryType (LOCAL | DOMICILIO | todos), search (cliente o número), clientId
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
  const statusParam = searchParams.get("status");
  const status: OrderStatus | "todos" =
    statusParam && statusParam.trim() !== "" ? (statusParam as OrderStatus) : "todos";
  const deliveryType = searchParams.get("deliveryType") as "LOCAL" | "DOMICILIO" | "todos" | null;
  const search = searchParams.get("search") ?? undefined;
  const clientIdParam = searchParams.get("clientId");
  const clientId = clientIdParam ? parseInt(clientIdParam, 10) : undefined;

  const orders = await listOrders({
    status,
    deliveryType: deliveryType === "LOCAL" || deliveryType === "DOMICILIO" ? deliveryType : "todos",
    search,
    clientId: clientId != null && !Number.isNaN(clientId) ? clientId : undefined,
  });

  return NextResponse.json({ orders });
}
