"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Store, Plus, Trash2, Loader2, MapPin } from "lucide-react";
import type { Coords } from "@/components/admin/settings/LocationPicker";
import type { BusinessPin } from "@/components/admin/dashboard/BusinessesMap";
import AddressSearch, { type AddressResult } from "@/components/admin/settings/AddressSearch";

const LocationPicker = dynamic(
  () => import("@/components/admin/settings/LocationPicker"),
  { ssr: false }
);
const BusinessesMap = dynamic(
  () => import("@/components/admin/dashboard/BusinessesMap"),
  { ssr: false }
);

type Business = {
  id: number;
  name: string;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
};

const emptyForm = { name: "", address: "", coords: null as Coords | null };

export default function MyBusinessesPanel() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/businesses");
      if (!res.ok) throw new Error("Error al cargar negocios");
      const data = await res.json();
      setBusinesses(data.businesses ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  async function handleSave() {
    const name = form.name.trim();
    if (!name) {
      setError("El nombre del negocio es obligatorio.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address: form.address.trim() || null,
          latitude: form.coords?.lat ?? null,
          longitude: form.coords?.lng ?? null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al guardar negocio");
      }
      setForm(emptyForm);
      setShowForm(false);
      fetchBusinesses();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/v1/businesses/${id}`, { method: "DELETE" });
      if (res.ok) setBusinesses((prev) => prev.filter((b) => b.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  const pins: BusinessPin[] = businesses
    .filter((b) => b.latitude != null && b.longitude != null)
    .map((b) => ({
      id: b.id,
      name: b.name,
      address: b.address,
      lat: Number(b.latitude),
      lng: Number(b.longitude),
    }));

  return (
    <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Store className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
          <h2 className="text-lg font-medium text-neutral-900 dark:text-white">Mis negocios</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-800 dark:bg-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Registrar negocio
        </button>
      </div>

      <div className="p-5 space-y-5">
        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {showForm && (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Nombre del negocio
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej. Sucursal Centro"
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Dirección (opcional)
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Av. Principal 123"
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Ubicación
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                Busca un país, ciudad o dirección para ubicar el negocio automáticamente, o haz
                clic en el mapa para ajustar el punto a mano.
              </p>
              <div className="mb-3">
                <AddressSearch
                  onSelect={(result: AddressResult) =>
                    setForm((f) => ({
                      ...f,
                      address: result.displayName,
                      coords: { lat: result.lat, lng: result.lng },
                    }))
                  }
                />
              </div>
              <LocationPicker
                value={form.coords}
                onChange={(coords) => setForm((f) => ({ ...f, coords }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                Guardar negocio
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(emptyForm);
                }}
                className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Cargando…</p>
        ) : businesses.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Todavía no has registrado ningún negocio.
          </p>
        ) : (
          <>
            <BusinessesMap businesses={pins} />
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {businesses.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <MapPin className="h-4 w-4 mt-0.5 text-neutral-400 shrink-0" aria-hidden />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {b.name}
                      </p>
                      {b.address && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                          {b.address}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id)}
                    disabled={deletingId === b.id}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
