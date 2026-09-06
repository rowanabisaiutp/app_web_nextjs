"use client";

import {
  Shield,
  LogIn,
  ShieldCheck,
  UsersRound,
  BadgeCheck,
  UserPlus,
  Plus,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useMemo, useState } from "react";
import {
  AdminPageHeader,
  AdminCard,
  AdminTable,
  getUsersTableColumns,
} from "@/components/admin";
import { type AdminUserRow, formatUserFromApi } from "@/lib/admin";

type BusinessOption = { id: number; name: string };

const emptyCreateForm = {
  email: "",
  password: "",
  name: "",
  role: "CAJERO" as "ADMIN" | "CAJERO",
  workBusinessId: "" as number | "",
};

export default function AuthYRolesPage() {
  const { user: currentUser, logout } = useAuth();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [savingCreate, setSavingCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const businessNames = useMemo(
    () => Object.fromEntries(businesses.map((b) => [b.id, b.name])),
    [businesses]
  );

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

  const fetchBusinesses = async () => {
    try {
      const res = await fetch("/api/v1/businesses");
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data.businesses ?? []);
      }
    } catch {
      // silencioso: el selector de negocio queda vacío si falla
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBusinesses();
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

  const handleCreateUser = async () => {
    const email = createForm.email.trim();
    const password = createForm.password;
    if (!email) {
      setCreateError("Email requerido");
      return;
    }
    if (!password || password.length < 8) {
      setCreateError("Contraseña mínima 8 caracteres");
      return;
    }
    if (createForm.role === "CAJERO" && createForm.workBusinessId === "") {
      setCreateError("Selecciona un negocio para el cajero");
      return;
    }
    setSavingCreate(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: createForm.name.trim() || null,
          role: createForm.role,
          workBusinessId: createForm.role === "CAJERO" ? createForm.workBusinessId : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear usuario");
      setShowCreateForm(false);
      setCreateForm(emptyCreateForm);
      await fetchUsers();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Error al crear usuario");
    } finally {
      setSavingCreate(false);
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
          headerAction={
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-800 dark:hover:bg-neutral-300"
            >
              <Plus className="h-4 w-4" /> Nuevo usuario
            </button>
          }
          headerBetween
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
              businessNames,
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
          subtitle="Permisos por ruta según el rol del usuario"
        >
          <div className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              ADMIN tiene acceso total al panel. CAJERO solo puede crear pedidos, ver los
              pedidos de su propio negocio y registrar pagos para esos pedidos — el resto del
              panel (menú, clientes, promociones, reportes, configuración, etc.) no está
              disponible para ese rol.
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
          subtitle="El sistema soporta dos roles: ADMIN y CAJERO."
        >
          <div className="p-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-600">
              <span className="inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                ADMIN
              </span>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Acceso total al panel y configuración, sin restricción de negocio.
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-600">
              <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                CAJERO
              </span>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Crea pedidos y registra pagos, limitado al negocio asignado en
                &quot;Usuarios del panel&quot;.
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      {showCreateForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
            <h3 className="mb-4 text-lg font-medium text-neutral-900 dark:text-white">
              Nuevo usuario
            </h3>
            {createError && (
              <p className="mb-4 text-sm text-red-600 dark:text-red-400">{createError}</p>
            )}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Email *
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Contraseña * (mín. 8)
                </label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Nombre
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Rol
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      role: e.target.value as "ADMIN" | "CAJERO",
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                >
                  <option value="CAJERO">Cajero</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {createForm.role === "CAJERO" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Negocio *
                  </label>
                  <select
                    value={createForm.workBusinessId}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        workBusinessId: e.target.value ? Number(e.target.value) : "",
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                  >
                    <option value="">Selecciona un negocio…</option>
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  {businesses.length === 0 && (
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      No tienes negocios registrados todavía.
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateError(null);
                  setCreateForm(emptyCreateForm);
                }}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700/50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateUser}
                disabled={savingCreate}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-200 dark:text-neutral-800 dark:hover:bg-neutral-300"
              >
                {savingCreate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Crear usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
