import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { findUserById } from "@/lib/services/auth.service";
import { getPromotionById, updatePromotion, deletePromotion } from "@/lib/services/promotion.service";
import type { DiscountType } from "@/generated/prisma/enums";

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
 * GET /api/v1/promotions/[id]
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const promotionId = parseInt(id, 10);
  if (Number.isNaN(promotionId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  const promotion = await getPromotionById(promotionId);
  if (!promotion) return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 });
  return NextResponse.json({ promotion });
}

/**
 * PATCH /api/v1/promotions/[id] — Actualiza promoción (campos opcionales).
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const promotionId = parseInt(id, 10);
  if (Number.isNaN(promotionId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  let body: {
    code?: string | null;
    discountType?: string | null;
    value?: number | null;
    validUntil?: string | null;
    maxUses?: number | null;
    name?: string | null;
    description?: string | null;
    timeStart?: string | null;
    timeEnd?: string | null;
    active?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const discountType = body.discountType as DiscountType | undefined;
  if (body.discountType != null && discountType !== "PERCENT" && discountType !== "AMOUNT") {
    return NextResponse.json({ error: "discountType debe ser PERCENT o AMOUNT" }, { status: 400 });
  }
  try {
    const promotion = await updatePromotion(promotionId, {
      ...(body.code !== undefined && { code: body.code }),
      ...(body.discountType !== undefined && { discountType: discountType ?? null }),
      ...(body.value !== undefined && { value: body.value }),
      ...(body.validUntil !== undefined && { validUntil: body.validUntil }),
      ...(body.maxUses !== undefined && { maxUses: body.maxUses }),
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.timeStart !== undefined && { timeStart: body.timeStart }),
      ...(body.timeEnd !== undefined && { timeEnd: body.timeEnd }),
      ...(body.active !== undefined && { active: body.active }),
    });
    if (!promotion) return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 });
    return NextResponse.json({ promotion });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al actualizar";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

/**
 * DELETE /api/v1/promotions/[id]
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const promotionId = parseInt(id, 10);
  if (Number.isNaN(promotionId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  try {
    await deletePromotion(promotionId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 400 });
  }
}
