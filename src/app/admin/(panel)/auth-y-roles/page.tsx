"use client";

import {
  Shield,
  LogIn,
  ShieldCheck,
  UsersRound,
  BadgeCheck,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import {
  AdminPageHeader,
  AdminCard,
  AdminTable,
  getUsersTableColumns,
} from "@/components/admin";
import { type AdminUserRow, formatUserFromApi } from "@/lib/admin";

export default function AuthYRolesPage() {
  const { user: currentUser, logout } = useAuth();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/v1/users");
      if (res.ok) {
        const data = await res.json();
        setUsers((data.users ?? []).map(formatUserFromApi));
      } else setUsers([]);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveEdit = async (id: number) => {
    const res = await fetch(`/api/v1/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName || undefined }),
    });
    if (res.ok) {
      setEditingId(null);
      fetchUsers();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Error al actualizar");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este usuario del panel? No podrá volver a iniciar sesión.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/v1/users/${id}`, { method: "DELETE" });
      if (res.ok) fetchUsers();
      else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Error al eliminar");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <AdminPageHeader
        icon={<Shield aria-hidden />}
        title="Autenticación y roles"
        description="Login de administrador, usuarios del panel, sesión y roles del sistema"
      />

      <div className="space-y-6">
        <AdminCard
          title="Login y registro"
          icon={<LogIn aria-hidden />}
          subtitle="Acceso al panel con email y contraseña. Registra nuevos usuarios admin desde aquí."
        >
          <div className="flex flex-wrap gap-3 p-5">
            <Link
              href="/admin/register"
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-800 dark:hover:bg-neutral-300"
            >
              <UserPlus className="h-4 w-4" aria-hidden /> Registrar nuevo usuario admin
            </Link>
            <span className="self-center text-sm text-neutral-500 dark:text-neutral-400">
              El login está en{" "}
              <Link href="/admin/login" className="text-neutral-700 underline dark:text-neutral-300">
                /admin/login
              </Link>
            </span>
          </div>
        </AdminCard>

        <AdminCard
          title="Usuarios del panel"
          icon={<UsersRound aria-hidden />}
          subtitle="Lista de usuarios que pueden acceder al panel de administración"
        >
          <AdminTable<AdminUserRow>
            columns={getUsersTableColumns({
              editingId,
              editName,
              setEditName,
              setEditingId,
              currentUserId: currentUser?.id,
              deletingId,
              onSave: handleSaveEdit,
              onDelete: handleDelete,
            })}
            data={users}
            loading={loading}
            emptyMessage={
              <>
                No hay usuarios. Registra el primero en{" "}
                <Link href="/admin/register" className="text-neutral-700 underline dark:text-neutral-300">
                  Registro
                </Link>
                .
              </>
            }
            getRowKey={(u) => u.id}
          />
        </AdminCard>

        <AdminCard
          title="Control de acceso"
          icon={<ShieldCheck aria-hidden />}
          subtitle="Permisos por ruta. Hoy todos los usuarios del panel tienen rol Admin (acceso total)."
        >
          <div className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Cuando añadas más roles (Operador, Cajero) en el esquema, aquí podrás configurar qué
              rutas puede ver cada uno.
            </p>
          </div>
        </AdminCard>

        <AdminCard
          title="Sesión actual"
          icon={<UsersRound aria-hidden />}
          subtitle="Usuario con el que estás conectado al panel"
        >
          <div className="p-5">
            {currentUser ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-600">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-600">
                    <UsersRound className="h-4 w-4 text-neutral-500" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {currentUser.email}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Rol: {currentUser.role} · Sesión activa
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                Cargando sesión...
              </p>
            )}
          </div>
        </AdminCard>

        <AdminCard
          title="Roles del sistema"
          icon={<BadgeCheck aria-hidden />}
          subtitle="Actualmente el sistema usa el rol Admin (acceso total al panel)."
        >
          <div className="p-5">
            <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-600">
              <span className="inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                ADMIN
              </span>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Acceso total al panel y configuración. Cuando añadas OPERADOR o CAJERO en el enum
                Role del schema, podrás asignarlos desde la tabla de usuarios.
              </p>
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
