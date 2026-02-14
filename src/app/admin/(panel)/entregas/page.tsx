"use client";

import {
  Truck,
  MapPin,
  Store,
  Home,
  Search,
  CheckCircle,
  Package,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { AdminPageHeader, AdminCard, AdminTable } from "@/components/admin";
import { formatDateTime } from "@/lib/utils/format";

const ESTADOS = [
  { id: "todos", label: "Todos" },
  { id: "CONFIRMADO", label: "Confirmado" },
  { id: "EN_PREPARACION", label: "En preparación" },
  { id: "LISTO", label: "Listo" },
  { id: "ENTREGADO", label: "Entregado" },
  { id: "CANCELADO", label: "Cancelado" },
] as const;

const BADGE_STATUS: Record<string, string> = {
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
  deliveryAddress: string | null;
  createdAt: string;
};

type OrderDetailRow = OrderRow & {
  notes: string | null;
  items: { id: number; productName: string; quantity: number; unitPrice: string; subtotal: string }[];
  updatedAt: string;
};

export default function EntregasPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTipo, setFilterTipo] = useState<"todos" | "LOCAL" | "DOMICILIO">("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [filterSearch, setFilterSearch] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailRow | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterTipo && filterTipo !== "todos") params.set("deliveryType", filterTipo);
      if (filterStatus && filterStatus !== "todos") params.set("status", filterStatus);
      if (searchDebounce.trim()) params.set("search", searchDebounce.trim());
      const res = await fetch(`/api/v1/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(
          (data.orders ?? []).map((o: OrderRow & { createdAt?: string | Date }) => ({
            ...o,
            deliveryAddress: o.deliveryAddress ?? null,
            createdAt:
              typeof o.createdAt === "string"
                ? o.createdAt
                : o.createdAt
                  ? formatDateTime(o.createdAt)
                  : "",
          }))
        );
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error ?? "Error al cargar entregas");
        setOrders([]);
      }
    } catch {
      setError("Error de conexión");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filterTipo, filterStatus, searchDebounce]);

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
        const o = data.order as OrderDetailRow & { createdAt?: string; updatedAt?: string };
        if (o) {
          setSelectedOrder({
            ...o,
            deliveryAddress: o.deliveryAddress ?? null,
            createdAt:
              typeof o.createdAt === "string"
                ? o.createdAt
                : o.createdAt
                  ? formatDateTime(o.createdAt)
                  : "",
            updatedAt:
              typeof o.updatedAt === "string"
                ? o.updatedAt
                : o.updatedAt
                  ? formatDateTime(o.updatedAt)
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

  const handleConfirmDelivery = async () => {
    if (!selectedOrder) return;
    if (selectedOrder.status === "ENTREGADO") return;
    setConfirming(true);
    try {
      const res = await fetch(`/api/v1/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ENTREGADO" }),
      });
      if (res.ok) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: "ENTREGADO" } : null));
        fetchOrders();
      }
    } catch {
      // ignore
    } finally {
      setConfirming(false);
    }
  };

  const displayAddress = (row: OrderRow | OrderDetailRow) =>
    row.deliveryType === "DOMICILIO" && row.deliveryAddress
      ? row.deliveryAddress
      : row.deliveryType === "LOCAL"
        ? "Recoger en local"
        : "—";

  const orderColumns = [
    {
      key: "id",
      label: "Pedido",
      render: (o: OrderRow) => (
        <span className="font-medium text-neutral-900 dark:text-white">#{o.id}</span>
      ),
    },
    {
      key: "client",
      label: "Cliente",
      render: (o: OrderRow) => (
        <span className="text-neutral-900 dark:text-white">
          {o.clientName || o.clientEmail}
        </span>
      ),
    },
    {
      key: "deliveryType",
      label: "Tipo",
      render: (o: OrderRow) =>
        o.deliveryType === "LOCAL" ? "Recoger en local" : "A domicilio",
    },
    {
      key: "address",
      label: "Dirección",
      className: "max-w-[200px] truncate text-neutral-600 dark:text-neutral-400",
      render: (o: OrderRow) => displayAddress(o),
    },
    {
      key: "status",
      label: "Estado",
      render: (o: OrderRow) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            BADGE_STATUS[o.status] ?? ""
          }`}
        >
          {o.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Fecha",
      render: (o: OrderRow) => (
        <span className="text-neutral-600 dark:text-neutral-400">
          {formatDateTime(o.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      align: "right" as const,
      render: (o: OrderRow) => (
        <button
          type="button"
          onClick={() => fetchDetail(o.id)}
          className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-500"
        >
          Ver <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <AdminPageHeader
        icon={<Truck aria-hidden />}
        title="Entregas"
        description="Pedidos para recoger en local, a domicilio y confirmación de entrega"
      />

      <div className="space-y-6">
        <AdminCard
          title="Tipo de entrega"
          subtitle="Filtra por recoger en local o a domicilio"
        >
          <div className="p-5 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => setFilterTipo("todos")}
              className={`flex items-center gap-4 rounded-lg border-2 px-5 py-4 min-w-[220px] text-left transition-colors ${
                filterTipo === "todos"
                  ? "border-neutral-300 dark:border-neutral-500 bg-neutral-50 dark:bg-neutral-700/30"
                  : "border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700/30"
              }`}
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-400">
                <Package className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">Todos</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Ver todos los pedidos</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFilterTipo("LOCAL")}
              className={`flex items-center gap-4 rounded-lg border-2 px-5 py-4 min-w-[220px] text-left transition-colors ${
                filterTipo === "LOCAL"
                  ? "border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                  : "border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700/30"
              }`}
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                <Store className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">Recoger en local</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">El cliente retira en el negocio</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFilterTipo("DOMICILIO")}
              className={`flex items-center gap-4 rounded-lg border-2 px-5 py-4 min-w-[220px] text-left transition-colors ${
                filterTipo === "DOMICILIO"
                  ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700/30"
              }`}
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <Home className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">A domicilio</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Envío a dirección del cliente</p>
              </div>
            </button>
          </div>
        </AdminCard>

        <AdminCard
          title="Entregas"
          headerAction={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-56">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                  aria-hidden
                />
                <input
                  type="text"
                  placeholder="Buscar por pedido o cliente..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-400"
                  aria-label="Buscar entregas"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                aria-label="Filtrar por estado"
              >
                {ESTADOS.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
          }
          headerBetween
        >
          <AdminTable<OrderRow>
            columns={orderColumns}
            data={orders}
            loading={loading}
            emptyMessage="No hay pedidos con estos filtros."
            getRowKey={(o) => o.id}
            rowClassName={(o) =>
              selectedOrder?.id === o.id ? "bg-neutral-100 dark:bg-neutral-700/50" : ""
            }
            error={error}
          />
        </AdminCard>

        <AdminCard title="Dirección de entrega" icon={<MapPin aria-hidden />}>
          <div className="p-5">
            {loadingDetail ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Cargando…</p>
            ) : selectedOrder ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  Pedido #{selectedOrder.id} · {selectedOrder.clientName || selectedOrder.clientEmail}
                </p>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {selectedOrder.deliveryType === "LOCAL"
                    ? "Recoger en local — El cliente retira en el negocio."
                    : selectedOrder.deliveryAddress || "Sin dirección indicada."}
                </p>
                {selectedOrder.notes && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                    Notas: {selectedOrder.notes}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Selecciona un pedido de la lista (Ver) para ver la dirección de entrega.
              </p>
            )}
          </div>
        </AdminCard>

        {/* Confirmación de entrega */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Package className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Confirmación de entrega
            </h2>
          </div>
          <div className="p-5">
            {selectedOrder ? (
              <div className="flex flex-wrap items-center gap-4">
                {selectedOrder.status === "ENTREGADO" ? (
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    <CheckCircle className="h-4 w-4" aria-hidden />
                    Este pedido ya está marcado como entregado.
                  </p>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleConfirmDelivery}
                      disabled={confirming}
                      className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" aria-hidden />
                      {confirming ? "Guardando…" : "Marcar como entregado"}
                    </button>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Marca el pedido #{selectedOrder.id} como entregado cuando el cliente reciba su pedido.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Selecciona un pedido de la lista para poder confirmar la entrega.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
