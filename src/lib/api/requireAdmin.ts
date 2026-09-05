import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { findUserById } from "@/lib/services/auth.service";
import type { UserSafe } from "@/lib/services/auth.service";

/**
 * Verifica que la request tenga una sesión válida y que el usuario sea ADMIN.
 * Misma lógica que se repetía en cada route.ts de src/app/api/v1/*:
 * cookie de sesión → verifyToken (JWT) → findUserById → chequear role === "ADMIN".
 *
 * Uso:
 *   const { error, user } = await requireAdmin();
 *   if (error) return error;
 */
export async function requireAdmin(): Promise<
  { error: NextResponse; user: null } | { error: null; user: UserSafe }
> {
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
