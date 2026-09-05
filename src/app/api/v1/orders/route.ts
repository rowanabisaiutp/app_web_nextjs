import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/requireAdmin";
import { listOrders } from "@/lib/services/order.service";
import type { OrderStatus } from "@/generated/prisma/enums";

/**
 * GET /api/v1/orders — Lista pedidos. Solo ADMIN.
 * Query: status, deliveryType (LOCAL | DOMICILIO | todos), search (cliente o número), clientId
 */
export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

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
