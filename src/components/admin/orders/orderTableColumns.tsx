"use client";

import type { AdminTableColumn } from "../ui/AdminTable";
import type { OrderRow } from "@/lib/admin";
import { ORDER_STATUS_OPTIONS, ORDER_STATUS_BADGE } from "@/lib/admin";

export function getOrderListColumns(
  onVer: (id: number) => void
): AdminTableColumn<OrderRow>[] {
  return [
    {
      key: "id",
      label: "#",
      render: (o) => <span className="font-medium text-neutral-900 dark:text-white">{o.id}</span>,
    },
    {
      key: "client",
      label: "Cliente",
      render: (o) => (
        <span className="text-neutral-900 dark:text-white">{o.clientName || o.clientEmail}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Fecha",
      render: (o) => <span className="text-neutral-600 dark:text-neutral-400">{o.createdAt}</span>,
    },
    {
      key: "status",
      label: "Estado",
      render: (o) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            ORDER_STATUS_BADGE[o.status] ??
            "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
          }`}
        >
          {ORDER_STATUS_OPTIONS.find((e) => e.id === o.status)?.label ?? o.status}
        </span>
      ),
    },
    {
      key: "total",
      label: "Total",
      align: "right",
      render: (o) => (
        <span className="font-medium text-neutral-900 dark:text-white">S/ {o.total}</span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      align: "center",
      render: (o) => (
        <button
          type="button"
          className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            onVer(o.id);
          }}
        >
          Ver
        </button>
      ),
    },
  ];
}
