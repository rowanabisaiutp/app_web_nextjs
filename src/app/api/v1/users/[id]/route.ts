import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/requireAdmin";
import { updateUser, deleteUser } from "@/lib/services/auth.service";

/**
 * PATCH /api/v1/users/[id] — Actualiza nombre y/o rol. Solo ADMIN.
 */
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user: currentUser } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  let body: { name?: string; role?: string };
  try {
    body = await _req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const data: { name?: string | null; role?: "ADMIN" } = {};
  if (typeof body.name === "string") data.name = body.name;
  if (body.role === "ADMIN") data.role = "ADMIN";

  const user = await updateUser(userId, data, currentUser.id);
  return NextResponse.json({ user });
}

/**
 * DELETE /api/v1/users/[id] — Elimina usuario. Solo ADMIN. No se puede borrar a uno mismo.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user: currentUser } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  if (currentUser && currentUser.id === userId) {
    return NextResponse.json(
      { error: "No puedes eliminar tu propio usuario" },
      { status: 400 }
    );
  }

  await deleteUser(userId, currentUser?.id ?? null);
  return NextResponse.json({ ok: true });
}
