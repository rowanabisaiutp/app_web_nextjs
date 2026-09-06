import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/requireAdmin";
import { getPromotionById, updatePromotion, deletePromotion } from "@/lib/services/promotion.service";
import type { DiscountType } from "@/generated/prisma/enums";

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
  const { error, user } = await requireAdmin();
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
    const promotion = await updatePromotion(
      promotionId,
      {
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
      },
      user.id
    );
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
  const { error, user } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const promotionId = parseInt(id, 10);
  if (Number.isNaN(promotionId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  try {
    await deletePromotion(promotionId, user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 400 });
  }
}
