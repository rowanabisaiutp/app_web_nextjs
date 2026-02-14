"use client";

import type { AdminTableColumn } from "../ui/AdminTable";
import type { ClientOrderRow } from "@/lib/admin";
import { formatDateTime } from "@/lib/utils/format";

export const CLIENT_ORDERS_COLUMNS: AdminTableColumn<ClientOrderRow>[] = [
  {
    key: "id",
    label: "Pedido",
    render: (o) => (
      <span className="font-medium text-neutral-900 dark:text-white">#{o.id}</span>
    ),
  },
  {
    key: "createdAt",
    label: "Fecha",
    render: (o) => (
      <span className="text-neutral-600 dark:text-neutral-400">
        {formatDateTime(o.createdAt)}
      </span>
    ),
  },
  {
    key: "total",
    label: "Total",
    align: "right",
    render: (o) => (
      <span className="text-neutral-900 dark:text-white">S/ {o.total}</span>
    ),
  },
  {
    key: "status",
    label: "Estado",
    render: (o) => (
      <span className="rounded-full px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300">
        {o.status}
      </span>
    ),
  },
];
