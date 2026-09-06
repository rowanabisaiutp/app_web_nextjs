import { prisma } from "@/lib/prisma";

export type NotificationDto = {
  id: number;
  title: string;
  message: string;
  type: string;
  resourceType: string | null;
  resourceId: number | null;
  read: boolean;
  createdAt: Date;
};

function toDto(row: {
  id: number;
  title: string;
  message: string;
  type: string;
  resourceType: string | null;
  resourceId: number | null;
  read: boolean;
  createdAt: Date;
}): NotificationDto {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    resourceType: row.resourceType,
    resourceId: row.resourceId,
    read: row.read,
    createdAt: row.createdAt,
  };
}

export type CreateNotificationInput = {
  title: string;
  message: string;
  type: string;
  resourceType?: string | null;
  resourceId?: number | null;
};

/**
 * Crea una notificación interna del panel. Usar desde otros servicios
 * (pedido creado, cambio de estado, nuevo usuario admin, etc.).
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<NotificationDto> {
  const row = await prisma.notification.create({
    data: {
      title: input.title.substring(0, 200),
      message: input.message,
      type: input.type.substring(0, 50),
      resourceType: input.resourceType?.substring(0, 50) ?? null,
      resourceId: input.resourceId ?? null,
    },
  });
  return toDto(row);
}

/**
 * Lista las notificaciones más recientes (todas, leídas y no leídas).
 */
export async function listNotifications(limit = 50): Promise<NotificationDto[]> {
  const rows = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 100),
  });
  return rows.map(toDto);
}

/**
 * Cuenta las notificaciones no leídas.
 */
export async function countUnread(): Promise<number> {
  return prisma.notification.count({ where: { read: false } });
}

/**
 * Marca una notificación como leída. Devuelve null si no existe.
 */
export async function markAsRead(id: number): Promise<NotificationDto | null> {
  try {
    const row = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return toDto(row);
  } catch {
    return null;
  }
}

/**
 * Marca todas las notificaciones no leídas como leídas. Devuelve cuántas se actualizaron.
 */
export async function markAllAsRead(): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { read: false },
    data: { read: true },
  });
  return result.count;
}
