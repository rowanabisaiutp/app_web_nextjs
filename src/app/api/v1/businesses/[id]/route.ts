import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { findUserById } from "@/lib/services/auth.service";
import { deleteBusiness } from "@/lib/services/business.service";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;
  if (!token) return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }), user: null };
  const payload = await verifyToken(token);
  if (!payload) return { error: NextResponse.json({ error: "Sesión inválida" }, { status: 401 }), user: null };
  const user = await findUserById(payload.userId);
  if (!user || user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Sin permiso" }, { status: 403 }), user: null };
  }
  return { error: null, user };
}

/**
 * DELETE /api/v1/businesses/[id] — Elimina un negocio del admin logueado.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const businessId = Number(id);
  if (!Number.isInteger(businessId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  const deleted = await deleteBusiness(businessId, user.id);
  if (!deleted) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
