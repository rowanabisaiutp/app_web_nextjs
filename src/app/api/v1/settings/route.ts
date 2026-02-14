import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { findUserById } from "@/lib/services/auth.service";
import { getSettings, upsertSettings, type UpsertSettingsInput } from "@/lib/services/settings.service";

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
 * GET /api/v1/settings — Obtiene la configuración del negocio. Solo ADMIN.
 */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

/**
 * PATCH /api/v1/settings — Crea o actualiza la configuración. Solo ADMIN.
 * Body: campos opcionales de Settings (businessName, ruc, address, phone, email, logoUrl,
 * hoursJson, shippingCost, freeShippingFrom, igvPercent, pricesIncludeIgv).
 */
export async function PATCH(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const input: UpsertSettingsInput = {};
  if (typeof body.businessName === "string") input.businessName = body.businessName.trim() || undefined;
  if (body.ruc !== undefined) input.ruc = body.ruc === null || body.ruc === "" ? null : String(body.ruc);
  if (body.address !== undefined) input.address = body.address === null || body.address === "" ? null : String(body.address);
  if (body.phone !== undefined) input.phone = body.phone === null || body.phone === "" ? null : String(body.phone);
  if (body.email !== undefined) input.email = body.email === null || body.email === "" ? null : String(body.email);
  if (body.logoUrl !== undefined) input.logoUrl = body.logoUrl === null || body.logoUrl === "" ? null : String(body.logoUrl);
  if (body.hoursJson !== undefined) input.hoursJson = body.hoursJson === null || body.hoursJson === "" ? null : String(body.hoursJson);
  if (body.shippingCost !== undefined) input.shippingCost = body.shippingCost === null || body.shippingCost === "" ? null : Number(body.shippingCost);
  if (body.freeShippingFrom !== undefined) input.freeShippingFrom = body.freeShippingFrom === null || body.freeShippingFrom === "" ? null : Number(body.freeShippingFrom);
  if (body.igvPercent !== undefined) input.igvPercent = body.igvPercent === null || body.igvPercent === "" ? null : Number(body.igvPercent);
  if (typeof body.pricesIncludeIgv === "boolean") input.pricesIncludeIgv = body.pricesIncludeIgv;

  try {
    const settings = await upsertSettings(input);
    return NextResponse.json({ settings });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al guardar configuración";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
