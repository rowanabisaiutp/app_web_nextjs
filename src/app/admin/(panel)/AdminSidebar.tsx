"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { useAuth } from "@/hooks";

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

export function AdminSidebar({ user: userProp }: Props) {
  const pathname = usePathname();
  const { user: userFromAuth, logout } = useAuth();
  const displayEmail = userFromAuth?.email ?? userProp.email;
  const displayName = userFromAuth?.name ?? undefined;

  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <Link href="/admin" className="block">
          <span className="text-lg font-semibold text-neutral-900 dark:text-white">
            Panel Admin
          </span>
        </Link>
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
