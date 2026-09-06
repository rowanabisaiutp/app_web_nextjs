"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Inbox, RefreshCw, CheckCheck, Check } from "lucide-react";
import { AdminPageHeader, AdminCard, AdminTable } from "@/components/admin";
import { formatDateTime } from "@/lib/utils/format";

type NotificationRow = {
  id: number;
  title: string;
  message: string;
  type: string;
  resourceType: string | null;
  resourceId: number | null;
  read: boolean;
  createdAt: string;
};

const TYPE_LABELS: Record<string, string> = {
  ORDER_STATUS_CHANGED: "Cambio de estado de pedido",
  ADMIN_USER_CREATED: "Nuevo usuario admin",
};

function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

export default function NotificacionesPage() {
  const [filter, setFilter] = useState<"todas" | "no-leidas">("todas");
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/notifications?limit=100");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al cargar notificaciones");
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      setNotifications((data.notifications ?? []) as NotificationRow[]);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      setError("Error de conexión");
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = useCallback(async (id: number) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/v1/notifications/${id}`, { method: "PATCH" });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    setMarkingAll(true);
    try {
      const res = await fetch("/api/v1/notifications", { method: "PATCH" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } finally {
      setMarkingAll(false);
    }
  }, []);

  const visibleRows =
    filter === "no-leidas" ? notifications.filter((n) => !n.read) : notifications;

  const columns = [
    {
      key: "read",
      label: "",
      className: "w-8",
      render: (row: NotificationRow) =>
        !row.read ? (
          <span
            className="inline-block h-2 w-2 rounded-full bg-blue-500"
            aria-label="No leída"
            title="No leída"
          />
        ) : null,
    },
    {
      key: "createdAt",
      label: "Fecha / Hora",
      className: "whitespace-nowrap text-neutral-600 dark:text-neutral-400",
      render: (row: NotificationRow) => formatDateTime(row.createdAt),
    },
    {
      key: "type",
      label: "Tipo",
      render: (row: NotificationRow) => (
        <span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-600 dark:text-neutral-300">
          {typeLabel(row.type)}
        </span>
      ),
    },
    {
      key: "title",
      label: "Título",
      className: "font-medium",
      render: (row: NotificationRow) => row.title,
    },
    {
      key: "message",
      label: "Mensaje",
      className: "max-w-[360px] text-neutral-600 dark:text-neutral-400",
      render: (row: NotificationRow) => row.message,
    },
    {
      key: "actions",
      label: "",
      align: "right" as const,
      render: (row: NotificationRow) =>
        row.read ? (
          <span className="text-xs text-neutral-400 dark:text-neutral-500">Leída</span>
        ) : (
          <button
            type="button"
            onClick={() => handleMarkAsRead(row.id)}
            disabled={updatingId === row.id}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <Check className="h-3.5 w-3.5" aria-hidden />
            Marcar leída
          </button>
        ),
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <AdminPageHeader
        icon={<Bell aria-hidden />}
        title="Notificaciones"
        description="Avisos internos del panel: cambios de estado de pedidos, nuevos usuarios admin y otros eventos relevantes"
      />

      <div className="space-y-6">
        <AdminCard title="Filtros" icon={<Inbox aria-hidden />}>
          <div className="flex flex-wrap items-center gap-4 p-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilter("todas")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  filter === "todas"
                    ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-800"
                    : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setFilter("no-leidas")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  filter === "no-leidas"
                    ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-800"
                    : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                No leídas {unreadCount > 0 && `(${unreadCount})`}
              </button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={markingAll || unreadCount === 0}
                className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <CheckCheck className="h-4 w-4" aria-hidden />
                Marcar todas como leídas
              </button>
              <button
                type="button"
                onClick={() => fetchNotifications()}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
                Actualizar
              </button>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Historial de notificaciones" icon={<Bell aria-hidden />}>
          <AdminTable<NotificationRow>
            columns={columns}
            data={visibleRows}
            loading={loading}
            emptyMessage={
              filter === "no-leidas"
                ? "No hay notificaciones sin leer."
                : "No hay notificaciones todavía."
            }
            getRowKey={(row) => row.id}
            error={error}
          />
        </AdminCard>
      </div>
    </div>
  );
}
