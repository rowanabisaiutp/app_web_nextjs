"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { AdminTableColumn } from "../ui/AdminTable";
import type { AdminUserRow } from "@/lib/admin/users";

export type UsersTableColumnsParams = {
  editingId: number | null;
  editName: string;
  setEditName: (v: string) => void;
  setEditingId: (id: number | null) => void;
  currentUserId: number | undefined;
  deletingId: number | null;
  onSave: (id: number) => void;
  onDelete: (id: number) => void;
};

export function getUsersTableColumns({
  editingId,
  editName,
  setEditName,
  setEditingId,
  currentUserId,
  deletingId,
  onSave,
  onDelete,
}: UsersTableColumnsParams): AdminTableColumn<AdminUserRow>[] {
  return [
    {
      key: "email",
      label: "Email",
      render: (u) => (
        <span className="font-medium text-neutral-900 dark:text-white">{u.email}</span>
      ),
    },
    {
      key: "name",
      label: "Nombre",
      render: (u) =>
        editingId === u.id ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="max-w-[180px] rounded border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
            placeholder="Nombre"
            autoFocus
          />
        ) : (
          <span className="text-neutral-600 dark:text-neutral-400">{u.name || "—"}</span>
        ),
    },
    {
      key: "role",
      label: "Rol",
      render: (u) => (
        <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
          {u.role}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Registro",
      render: (u) => (
        <span className="text-neutral-600 dark:text-neutral-400">{u.createdAt}</span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      align: "right",
      render: (u) =>
        editingId === u.id ? (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
              onClick={() => onSave(u.id)}
            >
              Guardar
            </button>
            <button
              type="button"
              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              onClick={() => {
                setEditingId(null);
                setEditName("");
              }}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              onClick={() => {
                setEditingId(u.id);
                setEditName(u.name || "");
              }}
              title="Editar nombre"
            >
              <Pencil className="h-4 w-4" aria-hidden />
            </button>
            {currentUserId !== u.id && (
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                onClick={() => onDelete(u.id)}
                disabled={deletingId === u.id}
                title="Eliminar usuario"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        ),
    },
  ];
}
