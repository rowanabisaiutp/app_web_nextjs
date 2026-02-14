import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { findUserById } from "@/lib/services/auth.service";
import { getComboById, updateCombo, deleteCombo } from "@/lib/services/combo.service";

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
            .map((i) => ({ productId: i.productId, quantity: Math.max(1, i.quantity) })
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
