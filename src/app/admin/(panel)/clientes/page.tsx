"use client";

import { Users, Search, UserCircle, Plus, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import {
  AdminPageHeader,
  AdminCard,
  AdminTable,
  getClientsTableColumns,
  ClientDetailContent,
  type ClientDetailForm,
} from "@/components/admin";
import type { AdminClientRow, ClientOrderRow } from "@/lib/admin";

const emptyDetailForm: ClientDetailForm = {
  name: "",
  phone: "",
  address: "",
  blocked: false,
};

const emptyCreateForm = {
  email: "",
  password: "",
  name: "",
  phone: "",
  address: "",
};

export default function ClientesPage() {
  const [clients, setClients] = useState<AdminClientRow[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [selectedClient, setSelectedClient] = useState<AdminClientRow | null>(null);
  const [clientOrders, setClientOrders] = useState<ClientOrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [detailForm, setDetailForm] = useState<ClientDetailForm>(emptyDetailForm);
  const [savingDetail, setSavingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [savingCreate, setSavingCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoadingClients(true);
    setError(null);
    try {
      const url =
        searchDebounced.trim() === ""
          ? "/api/v1/clients"
          : `/api/v1/clients?search=${encodeURIComponent(searchDebounced.trim())}`;
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al cargar clientes");
      }
      const data = await res.json();
      setClients(data.clients ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar clientes");
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  }, [searchDebounced]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!selectedClient) {
      setClientOrders([]);
      return;
    }
    setLoadingOrders(true);
    fetch(`/api/v1/orders?clientId=${selectedClient.id}`)
      .then((res) => res.json())
      .then((data) => setClientOrders(data.orders ?? []))
      .catch(() => setClientOrders([]))
      .finally(() => setLoadingOrders(false));
  }, [selectedClient]);

  useEffect(() => {
    if (selectedClient) {
      setDetailForm({
        name: selectedClient.name ?? "",
        phone: selectedClient.phone ?? "",
        address: selectedClient.address ?? "",
        blocked: selectedClient.blocked,
      });
      setDetailError(null);
    }
  }, [selectedClient]);

  const handleSaveDetail = async () => {
    if (!selectedClient) return;
    setSavingDetail(true);
    setDetailError(null);
    try {
      const res = await fetch(`/api/v1/clients/${selectedClient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: detailForm.name.trim() || null,
          phone: detailForm.phone.trim() || null,
          address: detailForm.address.trim() || null,
          blocked: detailForm.blocked,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar");
      setSelectedClient({
        ...selectedClient,
        name: detailForm.name.trim() || null,
        phone: detailForm.phone.trim() || null,
        address: detailForm.address.trim() || null,
        blocked: detailForm.blocked,
      });
      await fetchClients();
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : "Error al actualizar");
    } finally {
      setSavingDetail(false);
    }
  };

  const handleToggleBlocked = useCallback(() => {
    if (!selectedClient) return;
    setDetailForm((prev) => ({ ...prev, blocked: !prev.blocked }));
  }, [selectedClient]);

  const handleCreateClient = async () => {
    const email = createForm.email.trim();
    const password = createForm.password;
    if (!email) {
      setCreateError("Email requerido");
      return;
    }
    if (!password || password.length < 6) {
      setCreateError("Contraseña mínima 6 caracteres");
      return;
    }
    setSavingCreate(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/v1/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: createForm.name.trim() || null,
          phone: createForm.phone.trim() || null,
          address: createForm.address.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear cliente");
      setShowCreateForm(false);
      setCreateForm(emptyCreateForm);
      await fetchClients();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Error al crear cliente");
    } finally {
      setSavingCreate(false);
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (!confirm("¿Eliminar este cliente? No se puede si tiene pedidos.")) return;
    setError(null);
    try {
      const res = await fetch(`/api/v1/clients/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      if (selectedClient?.id === id) setSelectedClient(null);
      await fetchClients();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <AdminPageHeader
        icon={<Users aria-hidden />}
        title="Gestión de clientes"
        description="Listado, detalle, historial de pedidos y datos de contacto."
      />

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <AdminCard
          title="Listado de clientes"
          headerAction={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                  aria-hidden
                />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-400"
                  aria-label="Buscar clientes"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-800 dark:hover:bg-neutral-300"
              >
                <Plus className="h-4 w-4" /> Nuevo cliente
              </button>
            </div>
          }
          headerBetween
        >
          <AdminTable<AdminClientRow>
            columns={getClientsTableColumns({
              onSelect: setSelectedClient,
              onDelete: handleDeleteClient,
            })}
            data={clients}
            loading={loadingClients}
            emptyMessage="No hay clientes. Crea uno o ajusta la búsqueda."
            getRowKey={(c) => c.id}
            rowClassName={(c) =>
              selectedClient?.id === c.id ? "bg-neutral-100 dark:bg-neutral-700/50" : ""
            }
            onRowClick={(c) => setSelectedClient(c)}
          />
        </AdminCard>

        <AdminCard title="Detalle del cliente" icon={<UserCircle aria-hidden />}>
          <ClientDetailContent
            client={selectedClient}
            form={detailForm}
            setForm={setDetailForm}
            saving={savingDetail}
            error={detailError}
            orders={clientOrders}
            loadingOrders={loadingOrders}
            onSave={handleSaveDetail}
            onToggleBlocked={handleToggleBlocked}
          />
        </AdminCard>
      </div>

      {showCreateForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
            <h3 className="mb-4 text-lg font-medium text-neutral-900 dark:text-white">
              Nuevo cliente
            </h3>
            {createError && (
              <p className="mb-4 text-sm text-red-600 dark:text-red-400">{createError}</p>
            )}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Email *
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                  placeholder="cliente@ejemplo.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Contraseña * (mín. 6)
                </label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Nombre
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Dirección
                </label>
                <textarea
                  value={createForm.address}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, address: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                  placeholder="Opcional"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateError(null);
                  setCreateForm(emptyCreateForm);
                }}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-700/50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateClient}
                disabled={savingCreate}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-200 dark:text-neutral-800 dark:hover:bg-neutral-300"
              >
                {savingCreate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Crear cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
