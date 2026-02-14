"use client";

import { XCircle } from "lucide-react";
import { AdminTable } from "../ui/AdminTable";
import type { AdminTableColumn } from "../ui/AdminTable";
import type { OrderDetailRow, OrderItemRow } from "@/lib/admin";
import { ORDER_STATUS_OPTIONS } from "@/lib/admin";

const DETAIL_ITEM_COLUMNS: AdminTableColumn<OrderItemRow>[] = [
  { key: "productName", label: "Producto" },
  { key: "quantity", label: "Cant.", align: "center", render: (r) => r.quantity },
  {
    key: "unitPrice",
    label: "P. unit.",
    align: "right",
    render: (r) => <span className="text-neutral-600 dark:text-neutral-400">S/ {r.unitPrice}</span>,
  },
  {
    key: "subtotal",
    label: "Subtotal",
    align: "right",
    render: (r) => <span className="font-medium text-neutral-900 dark:text-white">S/ {r.subtotal}</span>,
  },
];

export function OrderDetailContent({
  order,
  loading,
  updatingStatus,
  onStatusChange,
  onCancel,
}: {
  order: OrderDetailRow | null;
  loading: boolean;
  updatingStatus: boolean;
  onStatusChange: (orderId: number, status: string) => void;
  onCancel: (orderId: number) => void;
}) {
  if (loading) {
    return <p className="py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">Cargando detalle...</p>;
  }
  if (!order) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Selecciona un pedido de la lista para ver el detalle.
      </p>
    );
  }

  const clientLabel = order.clientName || order.clientEmail;
  const deliveryLabel = order.deliveryType === "DOMICILIO" ? "A domicilio" : "Recoger en local";
  const canChange = order.status !== "CANCELADO" && order.status !== "ENTREGADO";

  return (
    <div className="space-y-5 p-5">
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="text-neutral-500 dark:text-neutral-400">Cliente:</span>
        <span className="font-medium text-neutral-900 dark:text-white">{clientLabel}</span>
        <span className="text-neutral-500 dark:text-neutral-400">Entrega:</span>
        <span className="text-neutral-900 dark:text-white">{deliveryLabel}</span>
        {order.deliveryAddress && (
          <>
            <span className="text-neutral-500 dark:text-neutral-400">Dirección:</span>
            <span className="text-neutral-700 dark:text-neutral-300">{order.deliveryAddress}</span>
          </>
        )}
        {order.notes && (
          <>
            <span className="text-neutral-500 dark:text-neutral-400">Notas:</span>
            <span className="text-neutral-700 dark:text-neutral-300">{order.notes}</span>
          </>
        )}
      </div>
      <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-600">
        <AdminTable<OrderItemRow>
          columns={DETAIL_ITEM_COLUMNS}
          data={order.items}
          emptyMessage="Sin ítems"
          getRowKey={(item) => item.id}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-2 dark:border-neutral-600">
        <p className="text-sm font-medium text-neutral-900 dark:text-white">
          Total: <span className="text-lg">S/ {order.total}</span>
        </p>
        {canChange && (
          <div className="flex flex-wrap gap-2">
            <select
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-8 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value)}
              disabled={updatingStatus}
              aria-label="Cambiar estado"
            >
              {ORDER_STATUS_OPTIONS.filter((e) => e.id !== "todos" && e.id !== "CANCELADO").map(
                (e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                )
              )}
            </select>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={() => onCancel(order.id)}
              disabled={updatingStatus}
            >
              <XCircle className="h-4 w-4" aria-hidden /> Cancelar pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
