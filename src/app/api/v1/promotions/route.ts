import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { findUserById } from "@/lib/services/auth.service";
import { listPromotions, createPromotion } from "@/lib/services/promotion.service";
import type { PromotionType, DiscountType } from "@/generated/prisma/enums";

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
 * GET /api/v1/promotions — Lista promociones. Query: type (COUPON | TIME)
 */
export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as PromotionType | null;
  const promotions = await listPromotions({
    type: type === "COUPON" || type === "TIME" ? type : undefined,
  });
  return NextResponse.json({ promotions });
}

/**
 * POST /api/v1/promotions — Crea promoción. Body: type (COUPON|TIME), code?, discountType?, value?, validUntil?, maxUses?, name?, description?, timeStart?, timeEnd?, active?
 */
export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  let body: {
    type?: string;
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
  const type = body.type as PromotionType | undefined;
  if (type !== "COUPON" && type !== "TIME") {
    return NextResponse.json({ error: "type debe ser COUPON o TIME" }, { status: 400 });
  }
  if (type === "COUPON" && !body.code?.trim()) {
    return NextResponse.json({ error: "Código requerido para cupones" }, { status: 400 });
  }
  const discountType = body.discountType as DiscountType | undefined;
  if (body.discountType != null && discountType !== "PERCENT" && discountType !== "AMOUNT") {
    return NextResponse.json({ error: "discountType debe ser PERCENT o AMOUNT" }, { status: 400 });
  }
  try {
    const promotion = await createPromotion({
      type,
      code: body.code ?? null,
      discountType: discountType ?? null,
      value: body.value ?? null,
      validUntil: body.validUntil ?? null,
      maxUses: body.maxUses ?? null,
      name: body.name ?? null,
      description: body.description ?? null,
      timeStart: body.timeStart ?? null,
      timeEnd: body.timeEnd ?? null,
      active: body.active ?? true,
    });
    return NextResponse.json({ promotion });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al crear promoción";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
