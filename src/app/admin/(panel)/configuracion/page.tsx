"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Settings,
  Building2,
  Clock,
  Truck,
  Percent,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";

const DIAS_SEMANA = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"] as const;

type SettingsState = {
  businessName: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
  hours: Record<string, string>;
  shippingCost: string;
  freeShippingFrom: string;
  igvPercent: string;
  pricesIncludeIgv: boolean;
};

const emptySettings: SettingsState = {
  businessName: "",
  ruc: "",
  address: "",
  phone: "",
  email: "",
  logoUrl: "",
  hours: Object.fromEntries(DIAS_SEMANA.map((d) => [d, "09:00-18:00"])),
  shippingCost: "",
  freeShippingFrom: "",
  igvPercent: "",
  pricesIncludeIgv: true,
};

function parseHoursJson(json: string | null): Record<string, string> {
  if (!json) return { ...emptySettings.hours };
  try {
    const parsed = JSON.parse(json) as Record<string, string>;
    return { ...emptySettings.hours, ...parsed };
  } catch {
    return { ...emptySettings.hours };
  }
}

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SettingsState>(emptySettings);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/settings");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al cargar configuración");
      }
      const data = await res.json();
      const s = data.settings;
      if (s) {
        setForm({
          businessName: s.businessName ?? "",
          ruc: s.ruc ?? "",
          address: s.address ?? "",
          phone: s.phone ?? "",
          email: s.email ?? "",
          logoUrl: s.logoUrl ?? "",
          hours: parseHoursJson(s.hoursJson),
          shippingCost: s.shippingCost ?? "",
          freeShippingFrom: s.freeShippingFrom ?? "",
          igvPercent: s.igvPercent ?? "",
          pricesIncludeIgv: s.pricesIncludeIgv ?? true,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function saveSection(section: "info" | "hours" | "shipping" | "taxes") {
    setSaving(section);
    setError(null);
    try {
      const body: Record<string, unknown> = {};
      if (section === "info") {
        body.businessName = form.businessName.trim() || "Mi Negocio";
        body.ruc = form.ruc.trim() || null;
        body.address = form.address.trim() || null;
        body.phone = form.phone.trim() || null;
        body.email = form.email.trim() || null;
        body.logoUrl = form.logoUrl.trim() || null;
      } else if (section === "hours") {
        body.hoursJson = JSON.stringify(form.hours);
      } else if (section === "shipping") {
        body.shippingCost = form.shippingCost === "" ? null : Number(form.shippingCost);
        body.freeShippingFrom = form.freeShippingFrom === "" ? null : Number(form.freeShippingFrom);
      } else {
        body.igvPercent = form.igvPercent === "" ? null : Number(form.igvPercent);
        body.pricesIncludeIgv = form.pricesIncludeIgv;
      }
      const res = await fetch("/api/v1/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al guardar");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(null);
    }
  }

  const update = (updates: Partial<SettingsState>) => setForm((prev) => ({ ...prev, ...updates }));
  const updateHour = (day: string, value: string) =>
    setForm((prev) => ({ ...prev, hours: { ...prev.hours, [day]: value } }));

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[320px]">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-500" aria-hidden />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex items-center gap-3">
        <Settings className="h-8 w-8 text-neutral-500 dark:text-neutral-400" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Configuración del negocio
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Información del negocio, horarios, costos de envío e impuestos
          </p>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Información del negocio */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Información del negocio
            </h2>
          </div>
          <div className="p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Nombre del negocio
                </label>
                <input
                  type="text"
                  placeholder="Ej. Mi Comida"
                  value={form.businessName}
                  onChange={(e) => update({ businessName: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  aria-label="Nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  RUC (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. 20123456789"
                  value={form.ruc}
                  onChange={(e) => update({ ruc: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  aria-label="RUC"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-neutral-200 dark:bg-neutral-600 text-neutral-400 overflow-hidden">
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                  ) : (
                    <Building2 className="h-6 w-6" aria-hidden />
                  )}
                </span>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    URL del logo
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.logoUrl}
                    onChange={(e) => update({ logoUrl: e.target.value })}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2 text-sm"
                    aria-label="URL logo"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Dirección
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" aria-hidden />
                  <input
                    type="text"
                    placeholder="Av. Principal 123, Lima"
                    value={form.address}
                    onChange={(e) => update({ address: e.target.value })}
                    className="w-full pl-9 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                    aria-label="Dirección"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" aria-hidden />
                  <input
                    type="text"
                    placeholder="999 123 456"
                    value={form.phone}
                    onChange={(e) => update({ phone: e.target.value })}
                    className="w-full pl-9 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                    aria-label="Teléfono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Email de contacto
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" aria-hidden />
                  <input
                    type="email"
                    placeholder="contacto@negocio.com"
                    value={form.email}
                    onChange={(e) => update({ email: e.target.value })}
                    className="w-full pl-9 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                    aria-label="Email"
                  />
                </div>
              </div>
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => saveSection("info")}
                disabled={saving === "info"}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {saving === "info" && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar información
              </button>
            </div>
          </div>
        </section>

        {/* Horarios de atención */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Clock className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Horarios de atención
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Usa formato &quot;HH:mm-HH:mm&quot; o &quot;Cerrado&quot;.
            </p>
            <div className="space-y-3">
              {DIAS_SEMANA.map((dia) => (
                <div key={dia} className="flex items-center gap-4">
                  <label className="w-28 capitalize text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {dia}
                  </label>
                  <input
                    type="text"
                    value={form.hours[dia] ?? ""}
                    onChange={(e) => updateHour(dia, e.target.value)}
                    placeholder="09:00-18:00"
                    className="flex-1 max-w-xs rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2 text-sm"
                    aria-label={`Horario ${dia}`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => saveSection("hours")}
                disabled={saving === "hours"}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {saving === "hours" && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar horarios
              </button>
            </div>
          </div>
        </section>

        {/* Costos de envío */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Truck className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Costos de envío
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Configura el costo de envío para pedidos a domicilio.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Costo fijo (S/)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ej. 5.00"
                  value={form.shippingCost}
                  onChange={(e) => update({ shippingCost: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  aria-label="Costo envío"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Envío gratis desde (S/)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ej. 50.00"
                  value={form.freeShippingFrom}
                  onChange={(e) => update({ freeShippingFrom: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  aria-label="Monto mínimo envío gratis"
                />
              </div>
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => saveSection("shipping")}
                disabled={saving === "shipping"}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {saving === "shipping" && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar costos de envío
              </button>
            </div>
          </div>
        </section>

        {/* Impuestos */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Percent className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Impuestos
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              IGV u otro impuesto aplicable a los precios.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  IGV (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="Ej. 18"
                  value={form.igvPercent}
                  onChange={(e) => update({ igvPercent: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  aria-label="IGV"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.pricesIncludeIgv}
                    onChange={(e) => update({ pricesIncludeIgv: e.target.checked })}
                    className="rounded border-neutral-300 dark:border-neutral-600"
                    aria-label="Precios con IGV incluido"
                  />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Precios con IGV incluido
                  </span>
                </label>
              </div>
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => saveSection("taxes")}
                disabled={saving === "taxes"}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {saving === "taxes" && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar impuestos
              </button>
            </div>
          </div>
        </section>

        {/* Métodos de pago */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Métodos de pago
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Los métodos de pago (efectivo y tarjeta) están definidos en el sistema. No requieren configuración aquí.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
