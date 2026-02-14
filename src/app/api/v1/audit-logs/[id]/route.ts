import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { findUserById } from "@/lib/services/auth.service";
import { getAuditLogById } from "@/lib/services/auditLog.service";

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
 * GET /api/v1/audit-logs/[id] — Obtiene un log por ID. Solo ADMIN.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const logId = parseInt(id, 10);
  if (Number.isNaN(logId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const log = await getAuditLogById(logId);
  if (!log) return NextResponse.json({ error: "Log no encontrado" }, { status: 404 });
  return NextResponse.json({ log });
}
