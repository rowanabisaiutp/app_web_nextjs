import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { findUserById, updateUser, deleteUser } from "@/lib/services/auth.service";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;

  if (!token) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }), user: null };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return { error: NextResponse.json({ error: "Sesión inválida" }, { status: 401 }), user: null };
  }

  const user = await findUserById(payload.userId);
  if (!user || user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Sin permiso" }, { status: 403 }), user: null };
  }

  return { error: null, user };
}

/**
 * PATCH /api/admin/users/[id] — Actualiza nombre y/o rol. Solo ADMIN.
 */
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
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

  const user = await updateUser(userId, data);
  return NextResponse.json({ user });
}

/**
 * DELETE /api/admin/users/[id] — Elimina usuario. Solo ADMIN. No se puede borrar a uno mismo.
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

  await deleteUser(userId);
  return NextResponse.json({ ok: true });
}
