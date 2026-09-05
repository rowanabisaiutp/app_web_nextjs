import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/requireAdmin";
import { getAuditLogById } from "@/lib/services/auditLog.service";

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
