"use client";

import { Shield, LogIn, ShieldCheck, UsersRound, BadgeCheck, Pencil, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

type UserRow = {
  id: number;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
};

export default function AuthYRolesPage() {
  const { user: currentUser, logout } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(
          data.users.map((u: UserRow & { createdAt: Date }) => ({
            ...u,
            createdAt: typeof u.createdAt === "string" ? u.createdAt : u.createdAt ? new Date(u.createdAt).toLocaleDateString("es-PE") : "",
          }))
        );
      } else {
        setUsers([]);
      }
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
    const res = await fetch(`/api/admin/users/${id}`, {
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
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Error al eliminar");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex items-center gap-3">
        <Shield className="h-8 w-8 text-neutral-500 dark:text-neutral-400" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Autenticación y roles
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Login de administrador, usuarios del panel, sesión y roles del sistema
          </p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Login / Registro */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <LogIn className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <div>
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
                Login y registro
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Acceso al panel con email y contraseña. Registra nuevos usuarios admin desde aquí.
              </p>
            </div>
          </div>
          <div className="p-5 flex flex-wrap gap-3">
            <Link
              href="/admin/register"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
            >
              <UserPlus className="h-4 w-4" aria-hidden /> Registrar nuevo usuario admin
            </Link>
            <span className="text-sm text-neutral-500 dark:text-neutral-400 self-center">
              El login está en <Link href="/admin/login" className="text-neutral-700 dark:text-neutral-300 underline">/admin/login</Link>
            </span>
          </div>
        </section>

        {/* Usuarios del panel (CRUD) */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <UsersRound className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
              <div>
                <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
                  Usuarios del panel
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Lista de usuarios que pueden acceder al panel de administración
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Rol</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Registro</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                      Cargando...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-neutral-500 dark:text-neutral-400">
                      No hay usuarios. Registra el primero en <Link href="/admin/register" className="text-neutral-700 dark:text-neutral-300 underline">Registro</Link>.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                      <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{u.email}</td>
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                        {editingId === u.id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full max-w-[180px] rounded border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-2 py-1 text-sm"
                            placeholder="Nombre"
                            autoFocus
                          />
                        ) : (
                          u.name || "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{u.createdAt}</td>
                      <td className="px-4 py-3 text-right">
                        {editingId === u.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleSaveEdit(u.id)}
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                              onClick={() => { setEditingId(null); setEditName(""); }}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                              onClick={() => { setEditingId(u.id); setEditName(u.name || ""); }}
                              title="Editar nombre"
                            >
                              <Pencil className="h-4 w-4" aria-hidden />
                            </button>
                            {currentUser?.id !== u.id && (
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                                onClick={() => handleDelete(u.id)}
                                disabled={deletingId === u.id}
                                title="Eliminar usuario"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Control de acceso */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <div>
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
                Control de acceso
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Permisos por ruta. Hoy todos los usuarios del panel tienen rol Admin (acceso total).
              </p>
            </div>
          </div>
          <div className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Cuando añadas más roles (Operador, Cajero) en el esquema, aquí podrás configurar qué rutas puede ver cada uno.
            </p>
          </div>
        </section>

        {/* Sesión actual */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <UsersRound className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <div>
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
                Sesión actual
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Usuario con el que estás conectado al panel
              </p>
            </div>
          </div>
          <div className="p-5">
            {currentUser ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 rounded-lg border border-neutral-200 dark:border-neutral-600 px-4 py-3">
                  <span className="h-9 w-9 rounded-full bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center">
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
                  className="rounded-lg px-4 py-2.5 text-sm font-medium border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 py-6 text-center">
                Cargando sesión...
              </p>
            )}
          </div>
        </section>

        {/* Roles del sistema */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <div>
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
                Roles del sistema
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Actualmente el sistema usa el rol <strong>Admin</strong> (acceso total al panel).
              </p>
            </div>
          </div>
          <div className="p-5">
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 p-4">
              <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                ADMIN
              </span>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                Acceso total al panel y configuración. Cuando añadas OPERADOR o CAJERO en el enum Role del schema, podrás asignarlos desde la tabla de usuarios.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
