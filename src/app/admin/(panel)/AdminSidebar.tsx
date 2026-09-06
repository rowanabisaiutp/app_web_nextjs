"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Shield,
  ClipboardList,
  UtensilsCrossed,
  Users,
  CreditCard,
  Truck,
  Tag,
  TrendingUp,
  Bell,
  Settings,
  ScrollText,
  LogOut,
  CheckCheck,
} from "lucide-react";
import { useAuth } from "@/hooks";
import { formatDateTime } from "@/lib/utils/format";

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

const NOTIFICATIONS_POLL_MS = 30000;

const navItems = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/auth-y-roles", label: "Autenticación y roles", Icon: Shield },
  { href: "/admin/pedidos", label: "Gestión de pedidos", Icon: ClipboardList },
  { href: "/admin/menu", label: "Gestión del menú", Icon: UtensilsCrossed },
  { href: "/admin/clientes", label: "Gestión de clientes", Icon: Users },
  { href: "/admin/pagos", label: "Pagos", Icon: CreditCard },
  { href: "/admin/entregas", label: "Entregas", Icon: Truck },
  { href: "/admin/promociones", label: "Promociones y descuentos", Icon: Tag },
  { href: "/admin/reportes", label: "Reportes y métricas", Icon: TrendingUp },
  { href: "/admin/notificaciones", label: "Notificaciones", Icon: Bell },
  { href: "/admin/configuracion", label: "Configuración del negocio", Icon: Settings },
  { href: "/admin/logs", label: "Logs y auditoría", Icon: ScrollText },
];

type Props = {
  user: { email: string };
};

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/notifications?limit=8");
      if (!res.ok) return;
      const data = await res.json();
      setItems(
        (data.notifications ?? []).filter((n: NotificationItem) => !n.read)
      );
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // silencioso: no bloquear el panel si falla el fetch de notificaciones
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, NOTIFICATIONS_POLL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const markAsRead = useCallback(async (id: number) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await fetch(`/api/v1/notifications/${id}`, { method: "PATCH" });
    } catch {
      // el estado local ya se actualizó; un refresh futuro corrige inconsistencias
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setLoading(true);
    setItems([]);
    setUnreadCount(0);
    try {
      await fetch("/api/v1/notifications", { method: "PATCH" });
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700 transition-colors"
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ""}`}
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] max-h-[420px] rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
            <h2 className="text-sm font-medium text-neutral-900 dark:text-white">
              Notificaciones
            </h2>
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={loading || unreadCount === 0}
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden />
              Marcar todas
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                No hay notificaciones sin leer.
              </p>
            ) : (
              <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => markAsRead(n.id)}
                      className="w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700/40 transition-colors"
                    >
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                        {formatDateTime(n.createdAt)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="px-4 py-2.5 border-t border-neutral-200 dark:border-neutral-700 shrink-0">
            <Link
              href="/admin/notificaciones"
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              Ver todas las notificaciones
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminSidebar({ user: userProp }: Props) {
  const pathname = usePathname();
  const { user: userFromAuth, logout } = useAuth();
  const displayEmail = userFromAuth?.email ?? userProp.email;
  const displayName = userFromAuth?.name ?? undefined;

  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between gap-2">
          <Link href="/admin" className="block">
            <span className="text-lg font-semibold text-neutral-900 dark:text-white">
              Panel Admin
            </span>
          </Link>
          <NotificationBell />
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Negocio de comida
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5" role="list">
          {navItems.map(({ href, label, Icon }) => {
            const isActive =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
        {displayName && (
          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate px-2 mb-0.5">
            {displayName}
          </p>
        )}
        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate px-2 mb-2" title={displayEmail}>
          {displayEmail}
        </p>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white transition-colors text-left"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
