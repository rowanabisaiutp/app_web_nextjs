import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/requireAdmin";
import { listCombos, createCombo } from "@/lib/services/combo.service";

/**
 * GET /api/v1/combos — Lista combos
 */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const combos = await listCombos();
  return NextResponse.json({ combos });
}

/**
 * POST /api/v1/combos — Crea combo. Body: { name, price, active?, items?: [{ productId, quantity }] }
 */
export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  let body: {
    name?: string;
    price?: number;
    active?: boolean;
    items?: Array<{ productId: number; quantity: number }>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const name = body.name?.trim();
  const price = body.price;
  if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  if (price == null || typeof price !== "number" || price < 0) {
    return NextResponse.json({ error: "Precio inválido (debe ser >= 0)" }, { status: 400 });
  }
  const items = Array.isArray(body.items)
    ? body.items
        .filter((i) => i && typeof i.productId === "number" && typeof i.quantity === "number")
        .map((i) => ({ productId: i.productId, quantity: Math.max(1, i.quantity) }))
    : [];
  try {
    const combo = await createCombo({
      name,
      price,
      active: body.active ?? true,
      items,
    });
    return NextResponse.json({ combo });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al crear combo";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
