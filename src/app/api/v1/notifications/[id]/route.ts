import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/requireAdmin";
import { markAsRead } from "@/lib/services/notification.service";

/**
 * PATCH /api/v1/notifications/[id] — Marca una notificación como leída. Solo ADMIN.
 */
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const notificationId = parseInt(id, 10);
  if (Number.isNaN(notificationId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const notification = await markAsRead(notificationId);
  if (!notification) {
    return NextResponse.json({ error: "Notificación no encontrada" }, { status: 404 });
  }
  return NextResponse.json({ notification });
}
