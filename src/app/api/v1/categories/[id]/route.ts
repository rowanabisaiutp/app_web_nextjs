import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/requireAdmin";
import { updateCategory, deleteCategory } from "@/lib/services/menu.service";

/**
 * PATCH /api/v1/categories/[id] — Actualiza categoría. Body: { name }
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireAdmin();
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
  const category = await updateCategory(categoryId, name, user.id);
  return NextResponse.json({ category });
}

/**
 * DELETE /api/v1/categories/[id] — Elimina categoría. Falla si tiene productos.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const categoryId = parseInt(id, 10);
  if (Number.isNaN(categoryId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  try {
    await deleteCategory(categoryId, user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "No se puede eliminar: tiene productos asociados o no existe." },
      { status: 400 }
    );
  }
}
