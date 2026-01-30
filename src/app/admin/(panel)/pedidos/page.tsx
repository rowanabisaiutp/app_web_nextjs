"use client";

import {
  ClipboardList,
  Search,
  Filter,
  XCircle,
  ChevronDown,
  Clock,
  Package,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";

const ESTADOS = [
  { id: "todos", label: "Todos" },
  { id: "CONFIRMADO", label: "Confirmado" },
  { id: "EN_PREPARACION", label: "En preparación" },
  { id: "LISTO", label: "Listo" },
  { id: "ENTREGADO", label: "Entregado" },
  { id: "CANCELADO", label: "Cancelado" },
] as const;

const BADGE_CLASS: Record<string, string> = {
  CONFIRMADO: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  EN_PREPARACION: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  LISTO: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  ENTREGADO: "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300",
  CANCELADO: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
};

type OrderRow = {
  id: number;
  clientId: number;
  clientName: string | null;
  clientEmail: string;
  status: string;
  total: string;
  deliveryType: string;
  createdAt: string;
};

type OrderDetailRow = OrderRow & {
  deliveryAddress: string | null;
  notes: string | null;
  items: { id: number; productName: string; quantity: number; unitPrice: string; subtotal: string }[];
  updatedAt: string;
};

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
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(
          (data.orders ?? []).map((o: OrderRow & { createdAt?: Date }) => ({
            ...o,
            createdAt:
              typeof o.createdAt === "string"
                ? o.createdAt
                : o.createdAt
                  ? new Date(o.createdAt).toLocaleString("es-PE")
                  : "",
          }))
        );
      } else {
        setOrders([]);
      }
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
      const res = await fetch(`/api/admin/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        const o = data.order as OrderDetailRow & { createdAt?: Date; updatedAt?: Date };
        if (o) {
          setSelectedOrder({
            ...o,
            createdAt:
              typeof o.createdAt === "string"
                ? o.createdAt
                : o.createdAt
                  ? new Date(o.createdAt).toLocaleString("es-PE")
                  : "",
            updatedAt:
              typeof o.updatedAt === "string"
                ? o.updatedAt
                : o.updatedAt
                  ? new Date(o.updatedAt).toLocaleString("es-PE")
                  : "",
          });
        }
      }
    } catch {
      setSelectedOrder(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleChangeStatus = async (orderId: number, status: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchOrders();
        if (selectedOrder?.id === orderId) {
          const data = await res.json();
          const o = data.order as OrderDetailRow & { updatedAt?: Date };
          setSelectedOrder((prev) =>
            prev && prev.id === orderId
              ? { ...prev, status: o.status, updatedAt: o.updatedAt ? new Date(o.updatedAt).toLocaleString("es-PE") : prev.updatedAt }
              : prev
          );
        }
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Error al actualizar estado");
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancel = async (orderId: number) => {
    if (!confirm("¿Cancelar este pedido?")) return;
    await handleChangeStatus(orderId, "CANCELADO");
  };

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex items-center gap-3">
        <ClipboardList className="h-8 w-8 text-neutral-500 dark:text-neutral-400" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Gestión de pedidos
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Lista en tiempo real, detalle, cambio de estado y cancelación
          </p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Filtros */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Filter className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Filtros
            </h2>
          </div>
          <div className="p-5 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" aria-hidden />
              <input
                type="text"
                placeholder="Buscar por cliente o número..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm placeholder:text-neutral-400"
                aria-label="Buscar pedidos"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Estado:</span>
              <select
                className="rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm px-4 py-2 pr-8 appearance-none cursor-default"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filtrar por estado"
              >
                {ESTADOS.map((e) => (
                  <option key={e.id} value={e.id}>{e.label}</option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-neutral-400 -ml-6 pointer-events-none" aria-hidden />
            </div>
          </div>
        </section>

        {/* Lista de pedidos */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Clock className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Lista de pedidos
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">#</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-neutral-500 dark:text-neutral-400">
                      Cargando...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-neutral-500 dark:text-neutral-400">
                      No hay pedidos.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr
                      key={o.id}
                      className={`hover:bg-neutral-50 dark:hover:bg-neutral-700/30 cursor-pointer ${selectedOrder?.id === o.id ? "bg-neutral-100 dark:bg-neutral-700/50" : ""}`}
                      onClick={() => fetchDetail(o.id)}
                    >
                      <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{o.id}</td>
                      <td className="px-4 py-3 text-neutral-900 dark:text-white">
                        {o.clientName || o.clientEmail}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{o.createdAt}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE_CLASS[o.status] ?? "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"}`}
                        >
                          {ESTADOS.find((e) => e.id === o.status)?.label ?? o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-neutral-900 dark:text-white">
                        S/ {o.total}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchDetail(o.id);
                          }}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Detalle de pedido */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Package className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Detalle de pedido
            </h2>
          </div>
          <div className="p-5 space-y-5">
            {loadingDetail ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 py-8 text-center">
                Cargando detalle...
              </p>
            ) : !selectedOrder ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Selecciona un pedido de la lista para ver el detalle.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">Cliente:</span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {selectedOrder.clientName || selectedOrder.clientEmail}
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400">Entrega:</span>
                  <span className="text-neutral-900 dark:text-white">
                    {selectedOrder.deliveryType === "DOMICILIO" ? "A domicilio" : "Recoger en local"}
                  </span>
                  {selectedOrder.deliveryAddress && (
                    <>
                      <span className="text-neutral-500 dark:text-neutral-400">Dirección:</span>
                      <span className="text-neutral-700 dark:text-neutral-300">{selectedOrder.deliveryAddress}</span>
                    </>
                  )}
                  {selectedOrder.notes && (
                    <>
                      <span className="text-neutral-500 dark:text-neutral-400">Notas:</span>
                      <span className="text-neutral-700 dark:text-neutral-300">{selectedOrder.notes}</span>
                    </>
                  )}
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                        <th className="text-left px-4 py-2 font-medium text-neutral-700 dark:text-neutral-300">Producto</th>
                        <th className="text-center px-4 py-2 font-medium text-neutral-700 dark:text-neutral-300">Cant.</th>
                        <th className="text-right px-4 py-2 font-medium text-neutral-700 dark:text-neutral-300">P. unit.</th>
                        <th className="text-right px-4 py-2 font-medium text-neutral-700 dark:text-neutral-300">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                      {selectedOrder.items.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400">
                            Sin ítems
                          </td>
                        </tr>
                      ) : (
                        selectedOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 font-medium text-neutral-900 dark:text-white">{item.productName}</td>
                            <td className="px-4 py-2 text-center text-neutral-900 dark:text-white">{item.quantity}</td>
                            <td className="px-4 py-2 text-right text-neutral-600 dark:text-neutral-400">S/ {item.unitPrice}</td>
                            <td className="px-4 py-2 text-right font-medium text-neutral-900 dark:text-white">S/ {item.subtotal}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-neutral-200 dark:border-neutral-600">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    Total: <span className="text-lg">S/ {selectedOrder.total}</span>
                  </p>
                  {selectedOrder.status !== "CANCELADO" && selectedOrder.status !== "ENTREGADO" && (
                    <div className="flex flex-wrap gap-2">
                      <select
                        className="rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm px-3 py-2 pr-8"
                        value={selectedOrder.status}
                        onChange={(e) => handleChangeStatus(selectedOrder.id, e.target.value)}
                        disabled={updatingStatus}
                        aria-label="Cambiar estado"
                      >
                        <option value="CONFIRMADO">Confirmado</option>
                        <option value="EN_PREPARACION">En preparación</option>
                        <option value="LISTO">Listo</option>
                        <option value="ENTREGADO">Entregado</option>
                      </select>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                        onClick={() => handleCancel(selectedOrder.id)}
                        disabled={updatingStatus}
                      >
                        <XCircle className="h-4 w-4" aria-hidden /> Cancelar pedido
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
