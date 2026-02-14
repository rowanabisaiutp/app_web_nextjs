"use client";

import { ClipboardList, Search, Filter, ChevronDown, Clock, Package } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import {
  AdminPageHeader,
  AdminCard,
  AdminTable,
  OrderDetailContent,
  getOrderListColumns,
} from "@/components/admin";
import {
  type OrderRow,
  type OrderDetailRow,
  ORDER_STATUS_OPTIONS,
  formatOrderFromApi,
  formatOrderDetailFromApi,
} from "@/lib/admin";

export default function PedidosPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [filterSearch, setFilterSearch] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailRow | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus && filterStatus !== "todos") params.set("status", filterStatus);
      if (searchDebounce.trim()) params.set("search", searchDebounce.trim());
      const res = await fetch(`/api/v1/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders((data.orders ?? []).map(formatOrderFromApi));
      } else setOrders([]);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchDebounce]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounce(filterSearch), 400);
    return () => clearTimeout(t);
  }, [filterSearch]);

  const fetchDetail = useCallback(async (id: number) => {
    setLoadingDetail(true);
    setSelectedOrder(null);
    try {
      const res = await fetch(`/api/v1/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        const o = data.order;
        if (o) setSelectedOrder(formatOrderDetailFromApi(o));
      }
    } catch {
      setSelectedOrder(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleChangeStatus = useCallback(
    async (orderId: number, status: string) => {
      setUpdatingStatus(true);
      try {
        const res = await fetch(`/api/v1/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (res.ok) {
          await fetchOrders();
          if (selectedOrder?.id === orderId) {
            const data = await res.json();
            const o = data.order;
            if (o)
              setSelectedOrder((prev) =>
                prev && prev.id === orderId ? { ...prev, ...formatOrderDetailFromApi(o) } : prev
              );
          }
        } else {
          const err = await res.json().catch(() => ({}));
          alert(err.error || "Error al actualizar estado");
        }
      } finally {
        setUpdatingStatus(false);
      }
    },
    [selectedOrder?.id, fetchOrders]
  );

  const handleCancel = useCallback(
    async (orderId: number) => {
      if (!confirm("¿Cancelar este pedido?")) return;
      await handleChangeStatus(orderId, "CANCELADO");
    },
    [handleChangeStatus]
  );

  return (
    <div className="p-6 lg:p-8">
      <AdminPageHeader
        icon={<ClipboardList aria-hidden />}
        title="Gestión de pedidos"
        description="Lista en tiempo real, detalle, cambio de estado y cancelación"
      />
      <div className="space-y-6">
        <AdminCard title="Filtros" icon={<Filter aria-hidden />}>
          <div className="flex flex-wrap items-center gap-4 p-5">
            <div className="relative min-w-[200px] flex-1">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                aria-hidden
              />
              <input
                type="text"
                placeholder="Buscar por cliente o número..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-400"
                aria-label="Buscar pedidos"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Estado:</span>
              <select
                className="cursor-default appearance-none rounded-lg border border-neutral-200 bg-white px-4 py-2 pr-8 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filtrar por estado"
              >
                {ORDER_STATUS_OPTIONS.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="-ml-6 h-4 w-4 pointer-events-none text-neutral-400" aria-hidden />
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Lista de pedidos" icon={<Clock aria-hidden />}>
          <AdminTable<OrderRow>
            columns={getOrderListColumns(fetchDetail)}
            data={orders}
            loading={loading}
            emptyMessage="No hay pedidos."
            getRowKey={(o) => o.id}
            rowClassName={(o) => (selectedOrder?.id === o.id ? "bg-neutral-100 dark:bg-neutral-700/50" : "")}
            onRowClick={(o) => fetchDetail(o.id)}
          />
        </AdminCard>

        <AdminCard title="Detalle de pedido" icon={<Package aria-hidden />}>
          <OrderDetailContent
            order={selectedOrder}
            loading={loadingDetail}
            updatingStatus={updatingStatus}
            onStatusChange={handleChangeStatus}
            onCancel={handleCancel}
          />
        </AdminCard>
      </div>
    </div>
  );
}
