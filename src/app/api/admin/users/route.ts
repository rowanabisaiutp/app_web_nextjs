import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { findUserById, listUsers } from "@/lib/services/auth.service";

/**
 * GET /api/admin/users — Lista usuarios del panel. Solo ADMIN.
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }

  const currentUser = await findUserById(payload.userId);
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const users = await listUsers();
  return NextResponse.json({ users });
}
