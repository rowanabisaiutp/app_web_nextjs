import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { findUserById } from "@/lib/services/auth.service";
import { listAuditLogs } from "@/lib/services/auditLog.service";
import type { AuditLogType } from "@/generated/prisma/enums";

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
 * GET /api/v1/audit-logs — Lista logs de auditoría. Solo ADMIN.
 * Query: search, from (YYYY-MM-DD), to (YYYY-MM-DD), logType (ACTION|STATE_CHANGE|ERROR|todos), userId, limit, page
 */
export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const logTypeParam = searchParams.get("logType");
  const logType: AuditLogType | "todos" =
    logTypeParam === "ACTION" || logTypeParam === "STATE_CHANGE" || logTypeParam === "ERROR"
      ? logTypeParam
      : "todos";
  const userIdParam = searchParams.get("userId");
  const userId = userIdParam ? parseInt(userIdParam, 10) : undefined;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 50, 100) : 50;
  const pageParam = searchParams.get("page");
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const offset = (page - 1) * limit;

  try {
    const { logs, total } = await listAuditLogs({
      search,
      from,
      to,
      logType,
      userId: userId != null && !Number.isNaN(userId) ? userId : undefined,
      limit,
      offset,
    });
    return NextResponse.json({ logs, total, page, limit });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al listar logs";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
