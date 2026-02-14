"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { AdminTableColumn } from "../ui/AdminTable";
import type { AdminClientRow } from "@/lib/admin";

export type ClientsTableColumnsParams = {
  onSelect: (client: AdminClientRow) => void;
  onDelete: (id: number) => void;
};

export function getClientsTableColumns({
  onSelect,
  onDelete,
}: ClientsTableColumnsParams): AdminTableColumn<AdminClientRow>[] {
  return [
    {
      key: "client",
      label: "Cliente",
      render: (c) => (
        <button
          type="button"
          onClick={() => onSelect(c)}
          className="text-left font-medium text-neutral-900 dark:text-white hover:underline"
        >
          {c.name || c.email}
        </button>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (c) => (
        <span className="text-neutral-600 dark:text-neutral-400">{c.email}</span>
      ),
    },
    {
      key: "phone",
      label: "Teléfono",
      render: (c) => (
        <span className="text-neutral-600 dark:text-neutral-400">{c.phone || "—"}</span>
      ),
    },
    {
      key: "ordersCount",
      label: "Pedidos",
      render: (c) => (
        <span className="text-neutral-600 dark:text-neutral-400">{c.ordersCount}</span>
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: (c) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            c.blocked
              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
          }`}
        >
          {c.blocked ? "Bloqueado" : "Activo"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      align: "right",
      render: (c) => (
        <div className="flex items-center justify-end gap-0">
          <button
            type="button"
            onClick={() => onSelect(c)}
            className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            aria-label="Ver detalle"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(c.id)}
            className="p-2 text-red-500 hover:text-red-700"
            aria-label="Eliminar cliente"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];
}
