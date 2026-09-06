import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/requireAdmin";
import { listNotifications, countUnread, markAllAsRead } from "@/lib/services/notification.service";

/**
 * GET /api/v1/notifications — Lista notificaciones recientes + total no leídas. Solo ADMIN.
 * Query: limit (opcional, default 50, máx 100)
 */
export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 50, 100) : 50;

  try {
    const [notifications, unreadCount] = await Promise.all([
      listNotifications(limit),
      countUnread(),
    ]);
    return NextResponse.json({ notifications, unreadCount });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al listar notificaciones";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/v1/notifications — Marca todas las notificaciones como leídas. Solo ADMIN.
 */
export async function PATCH() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const updated = await markAllAsRead();
    return NextResponse.json({ ok: true, updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al marcar notificaciones";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
