import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/requireAdmin";
import { listOrders, createOrder } from "@/lib/services/order.service";
import type { OrderStatus, DeliveryType } from "@/generated/prisma/enums";

/**
 * GET /api/v1/orders — Lista pedidos. ADMIN ve todos (opcionalmente filtrando por
 * businessId); CAJERO solo ve los de su propio negocio (workBusinessId).
 * Query: status, deliveryType (LOCAL | DOMICILIO | todos), search (cliente o número),
 * clientId, businessId (solo aplica para ADMIN)
 */
export async function GET(req: Request) {
  const { error, user } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const status: OrderStatus | "todos" =
    statusParam && statusParam.trim() !== "" ? (statusParam as OrderStatus) : "todos";
  const deliveryType = searchParams.get("deliveryType") as "LOCAL" | "DOMICILIO" | "todos" | null;
  const search = searchParams.get("search") ?? undefined;
  const clientIdParam = searchParams.get("clientId");
  const clientId = clientIdParam ? parseInt(clientIdParam, 10) : undefined;

  let businessId: number | undefined;
  if (user.role === "CAJERO") {
    if (user.workBusinessId == null) {
      // Cajero sin negocio asignado: no puede ver pedidos de ningún negocio.
      return NextResponse.json({ orders: [] });
    }
    businessId = user.workBusinessId;
  } else {
    const businessIdParam = searchParams.get("businessId");
    const parsedBusinessId = businessIdParam ? parseInt(businessIdParam, 10) : undefined;
    businessId = parsedBusinessId != null && !Number.isNaN(parsedBusinessId) ? parsedBusinessId : undefined;
  }

  const orders = await listOrders({
    status,
    deliveryType: deliveryType === "LOCAL" || deliveryType === "DOMICILIO" ? deliveryType : "todos",
    search,
    clientId: clientId != null && !Number.isNaN(clientId) ? clientId : undefined,
    businessId,
  });

  return NextResponse.json({ orders });
}

/**
 * POST /api/v1/orders — Crea un pedido. ADMIN o CAJERO.
 * Body: { clientId, items: { productId, quantity }[], deliveryType, deliveryAddress?, notes?, businessId? }
 * CAJERO: el pedido siempre se atribuye a su propio workBusinessId (se ignora
 * cualquier businessId enviado en el body); si no tiene negocio asignado, 400.
 * ADMIN: puede enviar businessId opcionalmente (o dejarlo nulo).
 */
export async function POST(req: Request) {
  const { error, user } = await requireAuth();
  if (error) return error;

  let body: {
    clientId?: number;
    items?: { productId: number; quantity: number }[];
    deliveryType?: DeliveryType;
    deliveryAddress?: string | null;
    notes?: string | null;
    businessId?: number | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const clientId = body.clientId;
  if (clientId == null || typeof clientId !== "number") {
    return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "El pedido debe tener al menos un ítem" }, { status: 400 });
  }
  for (const item of body.items) {
    if (
      typeof item.productId !== "number" ||
      typeof item.quantity !== "number" ||
      item.quantity <= 0
    ) {
      return NextResponse.json({ error: "Ítems inválidos" }, { status: 400 });
    }
  }
  const deliveryType = body.deliveryType;
  if (deliveryType !== "LOCAL" && deliveryType !== "DOMICILIO") {
    return NextResponse.json({ error: "deliveryType debe ser LOCAL o DOMICILIO" }, { status: 400 });
  }
  if (deliveryType === "DOMICILIO" && !body.deliveryAddress?.trim()) {
    return NextResponse.json(
      { error: "Dirección requerida para entrega a domicilio" },
      { status: 400 }
    );
  }

  let businessId: number | null;
  if (user.role === "CAJERO") {
    if (user.workBusinessId == null) {
      return NextResponse.json({ error: "No tienes un negocio asignado" }, { status: 400 });
    }
    businessId = user.workBusinessId;
  } else {
    businessId = body.businessId ?? null;
  }

  try {
    const order = await createOrder(
      {
        clientId,
        items: body.items,
        deliveryType,
        deliveryAddress: body.deliveryAddress ?? null,
        notes: body.notes ?? null,
        businessId,
      },
      user.id
    );
    return NextResponse.json({ order });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al crear pedido";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
