import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/requireAdmin";
import { getComboById, updateCombo, deleteCombo } from "@/lib/services/combo.service";

/**
 * GET /api/v1/combos/[id]
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const comboId = parseInt(id, 10);
  if (Number.isNaN(comboId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  const combo = await getComboById(comboId);
  if (!combo) return NextResponse.json({ error: "Combo no encontrado" }, { status: 404 });
  return NextResponse.json({ combo });
}

/**
 * PATCH /api/v1/combos/[id] — Actualiza combo. Body: { name?, price?, active?, items? }
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const comboId = parseInt(id, 10);
  if (Number.isNaN(comboId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
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
  if (body.name !== undefined && !body.name?.trim()) {
    return NextResponse.json({ error: "Nombre no puede estar vacío" }, { status: 400 });
  }
  if (body.price !== undefined && (typeof body.price !== "number" || body.price < 0)) {
    return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
  }
  const items =
    body.items !== undefined
      ? Array.isArray(body.items)
        ? body.items
            .filter((i) => i && typeof i.productId === "number" && typeof i.quantity === "number")
            .map((i) => ({ productId: i.productId, quantity: Math.max(1, i.quantity) }))
        : []
      : undefined;
  const combo = await updateCombo(comboId, {
    ...(body.name !== undefined && { name: body.name.trim() }),
    ...(body.price !== undefined && { price: body.price }),
    ...(body.active !== undefined && { active: body.active }),
    ...(items !== undefined && { items }),
  });
  if (!combo) return NextResponse.json({ error: "Combo no encontrado" }, { status: 404 });
  return NextResponse.json({ combo });
}

/**
 * DELETE /api/v1/combos/[id]
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const comboId = parseInt(id, 10);
  if (Number.isNaN(comboId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  try {
    await deleteCombo(comboId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 400 });
  }
}
