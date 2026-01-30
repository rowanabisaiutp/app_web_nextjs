import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { findUserById } from "@/lib/services/auth.service";
import { updateCategory, deleteCategory } from "@/lib/services/menu.service";

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
 * PATCH /api/admin/categories/[id] — Actualiza categoría. Body: { name }
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const categoryId = parseInt(id, 10);
  if (Number.isNaN(categoryId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  const category = await updateCategory(categoryId, name);
  return NextResponse.json({ category });
}

/**
 * DELETE /api/admin/categories/[id] — Elimina categoría. Falla si tiene productos.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const categoryId = parseInt(id, 10);
  if (Number.isNaN(categoryId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  try {
    await deleteCategory(categoryId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "No se puede eliminar: tiene productos asociados o no existe." },
      { status: 400 }
    );
  }
}
