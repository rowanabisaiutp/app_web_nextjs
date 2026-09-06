"use client";

import {
  ClipboardList,
  Search,
  Filter,
  ChevronDown,
  Clock,
  Package,
  Plus,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
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

type ClientOption = { id: number; email: string; name: string | null };
type ProductOption = { id: number; name: string; price: string; available: boolean };
type CartItem = { productId: number; name: string; price: number; quantity: number };

const emptyNewClientForm = { email: "", password: "", name: "" };

export default function PedidosPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [filterSearch, setFilterSearch] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailRow | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // --- Creación de pedido ---
  const [showCreateOrder, setShowCreateOrder] = useState(false);

  const [clientSearch, setClientSearch] = useState("");
  const [clientResults, setClientResults] = useState<ClientOption[]>([]);
  const [searchingClients, setSearchingClients] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);

  const [showNewClientFields, setShowNewClientFields] = useState(false);
  const [newClientForm, setNewClientForm] = useState(emptyNewClientForm);
  const [savingNewClient, setSavingNewClient] = useState(false);

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [deliveryType, setDeliveryType] = useState<"LOCAL" | "DOMICILIO">("LOCAL");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [creatingOrder, setCreatingOrder] = useState(false);
  const [createOrderError, setCreateOrderError] = useState<string | null>(null);

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

  // Búsqueda de clientes (con debounce) para el formulario de nuevo pedido
  useEffect(() => {
    if (!showCreateOrder || selectedClient || clientSearch.trim() === "") {
      setClientResults([]);
      return;
    }
    let cancelled = false;
    setSearchingClients(true);
    const t = setTimeout(() => {
      fetch(`/api/v1/clients?search=${encodeURIComponent(clientSearch.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setClientResults(data.clients ?? []);
        })
        .catch(() => {
          if (!cancelled) setClientResults([]);
        })
        .finally(() => {
          if (!cancelled) setSearchingClients(false);
        });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [clientSearch, showCreateOrder, selectedClient]);

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

  const openCreateOrder = useCallback(async () => {
    setShowCreateOrder(true);
    setCreateOrderError(null);
    if (products.length === 0) {
      setLoadingProducts(true);
      try {
        const res = await fetch("/api/v1/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products ?? []);
        }
      } finally {
        setLoadingProducts(false);
      }
    }
  }, [products.length]);

  const closeCreateOrder = () => {
    setShowCreateOrder(false);
    setClientSearch("");
    setClientResults([]);
    setSelectedClient(null);
    setShowNewClientFields(false);
    setNewClientForm(emptyNewClientForm);
    setCart([]);
    setDeliveryType("LOCAL");
    setDeliveryAddress("");
    setNotes("");
    setCreateOrderError(null);
  };

  const handleCreateClientQuick = async () => {
    const email = newClientForm.email.trim();
    const password = newClientForm.password;
    if (!email) {
      setCreateOrderError("Email del cliente requerido");
      return;
    }
    if (!password || password.length < 6) {
      setCreateOrderError("Contraseña del cliente: mínimo 6 caracteres");
      return;
    }
    setSavingNewClient(true);
    setCreateOrderError(null);
    try {
      const res = await fetch("/api/v1/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: newClientForm.name.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear cliente");
      setSelectedClient({ id: data.client.id, email: data.client.email, name: data.client.name });
      setShowNewClientFields(false);
      setNewClientForm(emptyNewClientForm);
      setClientSearch("");
    } catch (e) {
      setCreateOrderError(e instanceof Error ? e.message : "Error al crear cliente");
    } finally {
      setSavingNewClient(false);
    }
  };

  const addToCart = (product: ProductOption) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        { productId: product.id, name: product.name, price: Number(product.price), quantity: 1 },
      ];
    });
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    setCart((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSubmitOrder = async () => {
    if (!selectedClient) {
      setCreateOrderError("Selecciona o crea un cliente");
      return;
    }
    if (cart.length === 0) {
      setCreateOrderError("Agrega al menos un producto");
      return;
    }
    if (deliveryType === "DOMICILIO" && !deliveryAddress.trim()) {
      setCreateOrderError("La dirección es requerida para entrega a domicilio");
      return;
    }
    setCreatingOrder(true);
    setCreateOrderError(null);
    try {
      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          deliveryType,
          deliveryAddress: deliveryType === "DOMICILIO" ? deliveryAddress.trim() : null,
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear pedido");
      closeCreateOrder();
      await fetchOrders();
    } catch (e) {
      setCreateOrderError(e instanceof Error ? e.message : "Error al crear pedido");
    } finally {
      setCreatingOrder(false);
    }
  };

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

        <AdminCard
          title="Lista de pedidos"
          icon={<Clock aria-hidden />}
          headerAction={
            <button
              type="button"
              onClick={openCreateOrder}
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-800 dark:hover:bg-neutral-300"
            >
              <Plus className="h-4 w-4" /> Nuevo pedido
            </button>
          }
          headerBetween
        >
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

      {showCreateOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          aria-modal="true"
        >
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                Nuevo pedido
              </h3>
              <button
                type="button"
                onClick={closeCreateOrder}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              {createOrderError && (
                <p className="text-sm text-red-600 dark:text-red-400">{createOrderError}</p>
              )}

              {/* Cliente */}
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Cliente *
                </label>
                {selectedClient ? (
                  <div className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-2 text-sm dark:border-neutral-600">
                    <span className="text-neutral-900 dark:text-white">
                      {selectedClient.name || selectedClient.email}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedClient(null)}
                      className="text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                        aria-hidden
                      />
                      <input
                        type="text"
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        placeholder="Buscar cliente por nombre o email..."
                        className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-4 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                      />
                    </div>
                    {searchingClients && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Buscando...</p>
                    )}
                    {clientResults.length > 0 && (
                      <ul className="max-h-40 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-600">
                        {clientResults.map((c) => (
                          <li key={c.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedClient(c);
                                setClientResults([]);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                            >
                              {c.name || c.email}{" "}
                              <span className="text-neutral-400">— {c.email}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowNewClientFields((v) => !v)}
                      className="text-xs font-medium text-neutral-600 underline hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                    >
                      {showNewClientFields ? "Cancelar" : "+ Crear cliente nuevo"}
                    </button>
                    {showNewClientFields && (
                      <div className="space-y-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-600">
                        <input
                          type="email"
                          placeholder="Email"
                          value={newClientForm.email}
                          onChange={(e) =>
                            setNewClientForm((prev) => ({ ...prev, email: e.target.value }))
                          }
                          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                        />
                        <input
                          type="password"
                          placeholder="Contraseña (mín. 6)"
                          value={newClientForm.password}
                          onChange={(e) =>
                            setNewClientForm((prev) => ({ ...prev, password: e.target.value }))
                          }
                          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                        />
                        <input
                          type="text"
                          placeholder="Nombre (opcional)"
                          value={newClientForm.name}
                          onChange={(e) =>
                            setNewClientForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                        />
                        <button
                          type="button"
                          onClick={handleCreateClientQuick}
                          disabled={savingNewClient}
                          className="inline-flex items-center gap-2 rounded-lg bg-neutral-800 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-200 dark:text-neutral-800"
                        >
                          {savingNewClient && <Loader2 className="h-4 w-4 animate-spin" />}
                          Crear y seleccionar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Productos */}
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Productos *
                </label>
                {loadingProducts ? (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Cargando productos...</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-600">
                    {products.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                        No hay productos disponibles.
                      </p>
                    ) : (
                      <ul className="divide-y divide-neutral-200 dark:divide-neutral-600">
                        {products.map((p) => (
                          <li
                            key={p.id}
                            className="flex items-center justify-between px-4 py-2 text-sm"
                          >
                            <span
                              className={
                                p.available
                                  ? "text-neutral-900 dark:text-white"
                                  : "text-neutral-400 line-through"
                              }
                            >
                              {p.name} — S/ {p.price}
                            </span>
                            <button
                              type="button"
                              onClick={() => addToCart(p)}
                              disabled={!p.available}
                              className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700/50"
                            >
                              Agregar
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {cart.length > 0 && (
                  <div className="mt-3 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-600">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                          <th className="px-3 py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                            Producto
                          </th>
                          <th className="px-3 py-2 text-center font-medium text-neutral-700 dark:text-neutral-300">
                            Cant.
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-neutral-700 dark:text-neutral-300">
                            Subtotal
                          </th>
                          <th className="px-3 py-2" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                        {cart.map((item) => (
                          <tr key={item.productId}>
                            <td className="px-3 py-2 text-neutral-900 dark:text-white">{item.name}</td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) =>
                                  updateCartQuantity(item.productId, Number(e.target.value))
                                }
                                className="w-16 rounded border border-neutral-200 bg-white px-2 py-1 text-center text-sm dark:border-neutral-600 dark:bg-neutral-800"
                              />
                            </td>
                            <td className="px-3 py-2 text-right text-neutral-900 dark:text-white">
                              S/ {(item.price * item.quantity).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.productId)}
                                className="text-red-500 hover:text-red-700"
                                aria-label="Quitar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="border-t border-neutral-200 px-3 py-2 text-right text-sm font-medium text-neutral-900 dark:border-neutral-600 dark:text-white">
                      Total: S/ {cartTotal.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              {/* Entrega */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Tipo de entrega
                  </label>
                  <select
                    value={deliveryType}
                    onChange={(e) => setDeliveryType(e.target.value as "LOCAL" | "DOMICILIO")}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                  >
                    <option value="LOCAL">Recoger en local</option>
                    <option value="DOMICILIO">A domicilio</option>
                  </select>
                </div>
                {deliveryType === "DOMICILIO" && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                      placeholder="Dirección de entrega"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Notas
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-neutral-200 px-6 py-4 dark:border-neutral-700">
              <button
                type="button"
                onClick={closeCreateOrder}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700/50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={creatingOrder}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-200 dark:text-neutral-800 dark:hover:bg-neutral-300"
              >
                {creatingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Crear pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
