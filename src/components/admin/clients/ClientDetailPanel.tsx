"use client";

import { Mail, Phone, MapPin, ClipboardList, Pencil, Loader2 } from "lucide-react";
import { AdminTable } from "../ui/AdminTable";
import type { AdminClientRow, ClientOrderRow } from "@/lib/admin";
import { CLIENT_ORDERS_COLUMNS } from "./clientOrdersColumns";

const inputClass =
  "w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400";

export type ClientDetailForm = {
  name: string;
  phone: string;
  address: string;
  blocked: boolean;
};

type ClientDetailContentProps = {
  client: AdminClientRow | null;
  form: ClientDetailForm;
  setForm: (updater: (prev: ClientDetailForm) => ClientDetailForm) => void;
  saving: boolean;
  error: string | null;
  orders: ClientOrderRow[];
  loadingOrders: boolean;
  onSave: () => void;
  onToggleBlocked: () => void;
};

export function ClientDetailContent({
  client,
  form,
  setForm,
  saving,
  error,
  orders,
  loadingOrders,
  onSave,
  onToggleBlocked,
}: ClientDetailContentProps) {
  if (!client) {
    return (
      <div className="p-5">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Selecciona un cliente de la lista para ver el detalle y el historial de pedidos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <Mail className="h-4 w-4" /> Email
          </label>
          <p className="text-sm text-neutral-900 dark:text-white">{client.email}</p>
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Nombre
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Opcional"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <Phone className="h-4 w-4" /> Teléfono
          </label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="Opcional"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <MapPin className="h-4 w-4" /> Dirección
          </label>
          <textarea
            value={form.address}
            onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            placeholder="Opcional"
            rows={2}
            className={inputClass}
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-200 dark:text-neutral-800 dark:hover:bg-neutral-300"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
          Guardar cambios
        </button>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={form.blocked}
            onChange={onToggleBlocked}
            className="rounded border-neutral-300 dark:border-neutral-600"
          />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Bloquear cliente (no puede realizar pedidos)
          </span>
        </label>
      </div>

      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <ClipboardList className="h-4 w-4" /> Historial de pedidos
        </h4>
        <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-600">
          <AdminTable<ClientOrderRow>
            columns={CLIENT_ORDERS_COLUMNS}
            data={orders}
            loading={loadingOrders}
            emptyMessage="Sin pedidos"
            getRowKey={(o) => o.id}
          />
        </div>
      </div>
    </div>
  );
}
