import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/requireAdmin";
import { deleteBusiness } from "@/lib/services/business.service";

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
