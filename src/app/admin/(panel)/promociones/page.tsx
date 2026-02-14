"use client";

import {
  Tag,
  Ticket,
  Package,
  Clock,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";

type TabId = "cupones" | "combos" | "tiempo";

type PromotionRow = {
  id: number;
  type: string;
  code: string | null;
  discountType: string | null;
  value: string | null;
  validUntil: string | null;
  maxUses: number | null;
  usedCount: number;
  name: string | null;
  description: string | null;
  timeStart: string | null;
  timeEnd: string | null;
  active: boolean;
  createdAt: string;
};

type ComboRow = {
  id: number;
  name: string;
  price: string;
  active: boolean;
  items: { productId: number; quantity: number; productName?: string }[];
  createdAt: string;
};

type ProductOption = { id: number; name: string };

const DISCOUNT_TYPES = [
  { id: "PERCENT", label: "Porcentaje (%)" },
  { id: "AMOUNT", label: "Monto fijo (S/)" },
] as const;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-PE", { dateStyle: "short" });
  } catch {
    return iso;
  }
}

export default function PromocionesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("cupones");

  // Cupones
  const [cupones, setCupones] = useState<PromotionRow[]>([]);
  const [loadingCupones, setLoadingCupones] = useState(true);
  const [editingCuponId, setEditingCuponId] = useState<number | null>(null);
  const [formCupon, setFormCupon] = useState({
    code: "",
    discountType: "PERCENT" as "PERCENT" | "AMOUNT",
    value: "",
    validUntil: "",
    maxUses: "",
    name: "",
    active: true,
  });
  const [submittingCupon, setSubmittingCupon] = useState(false);
  const [errorCupon, setErrorCupon] = useState<string | null>(null);

  // Combos
  const [combos, setCombos] = useState<ComboRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingCombos, setLoadingCombos] = useState(true);
  const [editingComboId, setEditingComboId] = useState<number | null>(null);
  const [formCombo, setFormCombo] = useState({
    name: "",
    price: "",
    active: true,
    items: [] as { productId: number; quantity: number }[],
  });
  const [submittingCombo, setSubmittingCombo] = useState(false);
  const [errorCombo, setErrorCombo] = useState<string | null>(null);

  // Promociones por tiempo
  const [promosTiempo, setPromosTiempo] = useState<PromotionRow[]>([]);
  const [loadingTiempo, setLoadingTiempo] = useState(true);
  const [editingTiempoId, setEditingTiempoId] = useState<number | null>(null);
  const [formTiempo, setFormTiempo] = useState({
    name: "",
    timeStart: "",
    timeEnd: "",
    discountType: "PERCENT" as "PERCENT" | "AMOUNT",
    value: "",
    active: true,
  });
  const [submittingTiempo, setSubmittingTiempo] = useState(false);
  const [errorTiempo, setErrorTiempo] = useState<string | null>(null);

  const fetchCupones = useCallback(async () => {
    setLoadingCupones(true);
    try {
      const res = await fetch("/api/v1/promotions?type=COUPON");
      if (res.ok) {
        const data = await res.json();
        setCupones(
          (data.promotions ?? []).map((p: PromotionRow & { createdAt?: string }) => ({
            ...p,
            createdAt: typeof p.createdAt === "string" ? p.createdAt : p.createdAt ? new Date(p.createdAt).toISOString() : "",
          }))
        );
      } else setCupones([]);
    } catch {
      setCupones([]);
    } finally {
      setLoadingCupones(false);
    }
  }, []);

  const fetchCombos = useCallback(async () => {
    setLoadingCombos(true);
    try {
      const [resCombos, resProducts] = await Promise.all([
        fetch("/api/v1/combos"),
        fetch("/api/v1/products"),
      ]);
      if (resCombos.ok) {
        const data = await resCombos.json();
        setCombos(
          (data.combos ?? []).map((c: ComboRow & { createdAt?: string }) => ({
            ...c,
            createdAt: typeof c.createdAt === "string" ? c.createdAt : c.createdAt ? new Date(c.createdAt).toISOString() : "",
          }))
        );
      } else setCombos([]);
      if (resProducts.ok) {
        const data = await resProducts.json();
        setProducts((data.products ?? []).map((p: ProductOption) => ({ id: p.id, name: p.name })));
      } else setProducts([]);
    } catch {
      setCombos([]);
    } finally {
      setLoadingCombos(false);
    }
  }, []);

  const fetchPromosTiempo = useCallback(async () => {
    setLoadingTiempo(true);
    try {
      const res = await fetch("/api/v1/promotions?type=TIME");
      if (res.ok) {
        const data = await res.json();
        setPromosTiempo(
          (data.promotions ?? []).map((p: PromotionRow & { createdAt?: string }) => ({
            ...p,
            createdAt: typeof p.createdAt === "string" ? p.createdAt : p.createdAt ? new Date(p.createdAt).toISOString() : "",
          }))
        );
      } else setPromosTiempo([]);
    } catch {
      setPromosTiempo([]);
    } finally {
      setLoadingTiempo(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "cupones") fetchCupones();
    else if (activeTab === "combos") fetchCombos();
    else fetchPromosTiempo();
  }, [activeTab, fetchCupones, fetchCombos, fetchPromosTiempo]);

  const resetFormCupon = () => {
    setEditingCuponId(null);
    setFormCupon({
      code: "",
      discountType: "PERCENT",
      value: "",
      validUntil: "",
      maxUses: "",
      name: "",
      active: true,
    });
    setErrorCupon(null);
  };

  const resetFormCombo = () => {
    setEditingComboId(null);
    setFormCombo({ name: "", price: "", active: true, items: [] });
    setErrorCombo(null);
  };

  const resetFormTiempo = () => {
    setEditingTiempoId(null);
    setFormTiempo({
      name: "",
      timeStart: "",
      timeEnd: "",
      discountType: "PERCENT",
      value: "",
      active: true,
    });
    setErrorTiempo(null);
  };

  const handleEditCupon = (p: PromotionRow) => {
    setEditingCuponId(p.id);
    setFormCupon({
      code: p.code ?? "",
      discountType: (p.discountType ?? "PERCENT") as "PERCENT" | "AMOUNT",
      value: p.value ?? "",
      validUntil: p.validUntil ? p.validUntil.slice(0, 10) : "",
      maxUses: p.maxUses != null ? String(p.maxUses) : "",
      name: p.name ?? "",
      active: p.active,
    });
    setErrorCupon(null);
  };

  const handleEditCombo = (c: ComboRow) => {
    setEditingComboId(c.id);
    setFormCombo({
      name: c.name,
      price: c.price,
      active: c.active,
      items: c.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });
    setErrorCombo(null);
  };

  const handleEditTiempo = (p: PromotionRow) => {
    setEditingTiempoId(p.id);
    setFormTiempo({
      name: p.name ?? "",
      timeStart: p.timeStart ?? "",
      timeEnd: p.timeEnd ?? "",
      discountType: (p.discountType ?? "PERCENT") as "PERCENT" | "AMOUNT",
      value: p.value ?? "",
      active: p.active,
    });
    setErrorTiempo(null);
  };

  const handleSubmitCupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCupon(null);
    const code = formCupon.code.trim();
    const valueNum = formCupon.value.trim() ? parseFloat(formCupon.value.replace(",", ".")) : NaN;
    const maxUsesNum = formCupon.maxUses.trim() ? parseInt(formCupon.maxUses, 10) : null;
    if (!code) {
      setErrorCupon("Código requerido");
      return;
    }
    if (!formCupon.discountType || (formCupon.discountType === "PERCENT" && (Number.isNaN(valueNum) || valueNum < 0 || valueNum > 100))) {
      setErrorCupon("Valor inválido (0-100 para %)");
      return;
    }
    if (formCupon.discountType === "AMOUNT" && (Number.isNaN(valueNum) || valueNum < 0)) {
      setErrorCupon("Valor inválido (monto >= 0)");
      return;
    }
    setSubmittingCupon(true);
    try {
      const url = editingCuponId
        ? `/api/v1/promotions/${editingCuponId}`
        : "/api/v1/promotions";
      const method = editingCuponId ? "PATCH" : "POST";
      const body =
        method === "POST"
          ? {
              type: "COUPON",
              code,
              discountType: formCupon.discountType,
              value: valueNum,
              validUntil: formCupon.validUntil.trim() || null,
              maxUses: maxUsesNum,
              name: formCupon.name.trim() || null,
              active: formCupon.active,
            }
          : {
              code,
              discountType: formCupon.discountType,
              value: valueNum,
              validUntil: formCupon.validUntil.trim() || null,
              maxUses: maxUsesNum,
              name: formCupon.name.trim() || null,
              active: formCupon.active,
            };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        resetFormCupon();
        fetchCupones();
      } else {
        setErrorCupon(data.error ?? "Error al guardar");
      }
    } catch {
      setErrorCupon("Error de conexión");
    } finally {
      setSubmittingCupon(false);
    }
  };

  const handleDeleteCupon = async (id: number) => {
    if (!confirm("¿Eliminar este cupón?")) return;
    try {
      const res = await fetch(`/api/v1/promotions/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (editingCuponId === id) resetFormCupon();
        fetchCupones();
      }
    } catch {
      // ignore
    }
  };

  const handleSubmitCombo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCombo(null);
    const name = formCombo.name.trim();
    const priceNum = formCombo.price.trim() ? parseFloat(formCombo.price.replace(",", ".")) : NaN;
    if (!name) {
      setErrorCombo("Nombre requerido");
      return;
    }
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setErrorCombo("Precio inválido");
      return;
    }
    setSubmittingCombo(true);
    try {
      const url = editingComboId ? `/api/v1/combos/${editingComboId}` : "/api/v1/combos";
      const method = editingComboId ? "PATCH" : "POST";
      const body =
        method === "POST"
          ? {
              name,
              price: priceNum,
              active: formCombo.active,
              items: formCombo.items.filter((i) => i.productId > 0),
            }
          : {
              name,
              price: priceNum,
              active: formCombo.active,
              items: formCombo.items.filter((i) => i.productId > 0),
            };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        resetFormCombo();
        fetchCombos();
      } else {
        setErrorCombo(data.error ?? "Error al guardar");
      }
    } catch {
      setErrorCombo("Error de conexión");
    } finally {
      setSubmittingCombo(false);
    }
  };

  const handleDeleteCombo = async (id: number) => {
    if (!confirm("¿Eliminar este combo?")) return;
    try {
      const res = await fetch(`/api/v1/combos/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (editingComboId === id) resetFormCombo();
        fetchCombos();
      }
    } catch {
      // ignore
    }
  };

  const handleSubmitTiempo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorTiempo(null);
    const valueNum = formTiempo.value.trim() ? parseFloat(formTiempo.value.replace(",", ".")) : null;
    if (formTiempo.discountType && valueNum != null && (Number.isNaN(valueNum) || valueNum < 0)) {
      setErrorTiempo("Valor inválido");
      return;
    }
    setSubmittingTiempo(true);
    try {
      const url = editingTiempoId
        ? `/api/v1/promotions/${editingTiempoId}`
        : "/api/v1/promotions";
      const method = editingTiempoId ? "PATCH" : "POST";
      const body =
        method === "POST"
          ? {
              type: "TIME",
              name: formTiempo.name.trim() || null,
              timeStart: formTiempo.timeStart.trim() || null,
              timeEnd: formTiempo.timeEnd.trim() || null,
              discountType: formTiempo.discountType,
              value: valueNum,
              active: formTiempo.active,
            }
          : {
              name: formTiempo.name.trim() || null,
              timeStart: formTiempo.timeStart.trim() || null,
              timeEnd: formTiempo.timeEnd.trim() || null,
              discountType: formTiempo.discountType,
              value: valueNum,
              active: formTiempo.active,
            };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        resetFormTiempo();
        fetchPromosTiempo();
      } else {
        setErrorTiempo(data.error ?? "Error al guardar");
      }
    } catch {
      setErrorTiempo("Error de conexión");
    } finally {
      setSubmittingTiempo(false);
    }
  };

  const handleDeleteTiempo = async (id: number) => {
    if (!confirm("¿Eliminar esta promoción por tiempo?")) return;
    try {
      const res = await fetch(`/api/v1/promotions/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (editingTiempoId === id) resetFormTiempo();
        fetchPromosTiempo();
      }
    } catch {
      // ignore
    }
  };

  const addComboItem = () => {
    setFormCombo((prev) => ({
      ...prev,
      items: [...prev.items, { productId: products[0]?.id ?? 0, quantity: 1 }],
    }));
  };

  const updateComboItem = (index: number, field: "productId" | "quantity", value: number) => {
    setFormCombo((prev) => {
      const next = [...prev.items];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, items: next };
    });
  };

  const removeComboItem = (index: number) => {
    setFormCombo((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const tabs: { id: TabId; label: string; icon: typeof Ticket }[] = [
    { id: "cupones", label: "Cupones", icon: Ticket },
    { id: "combos", label: "Combos", icon: Package },
    { id: "tiempo", label: "Promociones por tiempo", icon: Clock },
  ];

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex items-center gap-3">
        <Tag className="h-8 w-8 text-neutral-500 dark:text-neutral-400" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Promociones y descuentos
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Cupones, combos y promociones por tiempo
          </p>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-neutral-200 dark:border-neutral-700 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900"
                  : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-6">
        {/* ——— CUPONES ——— */}
        {activeTab === "cupones" && (
          <>
            <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Ticket className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
                  <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
                    {editingCuponId ? "Editar cupón" : "Nuevo cupón"}
                  </h2>
                </div>
                {editingCuponId && (
                  <button
                    type="button"
                    onClick={resetFormCupon}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <X className="h-4 w-4" /> Cancelar
                  </button>
                )}
              </div>
              <form onSubmit={handleSubmitCupon} className="p-5">
                {errorCupon && (
                  <p className="mb-4 text-sm text-red-600 dark:text-red-400">{errorCupon}</p>
                )}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Código del cupón *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. VERANO20"
                      value={formCupon.code}
                      onChange={(e) => setFormCupon((p) => ({ ...p, code: e.target.value }))}
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                      aria-label="Código"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Tipo de descuento
                    </label>
                    <select
                      value={formCupon.discountType}
                      onChange={(e) =>
                        setFormCupon((p) => ({ ...p, discountType: e.target.value as "PERCENT" | "AMOUNT" }))
                      }
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white"
                      aria-label="Tipo"
                    >
                      {DISCOUNT_TYPES.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Valor
                    </label>
                    <input
                      type="text"
                      placeholder={formCupon.discountType === "PERCENT" ? "Ej. 20" : "Ej. 5.00"}
                      value={formCupon.value}
                      onChange={(e) => setFormCupon((p) => ({ ...p, value: e.target.value }))}
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                      aria-label="Valor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Vigencia hasta
                    </label>
                    <input
                      type="date"
                      value={formCupon.validUntil}
                      onChange={(e) => setFormCupon((p) => ({ ...p, validUntil: e.target.value }))}
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white"
                      aria-label="Vigencia"
                    />
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Usos máximos (opcional)
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Ilimitado"
                      value={formCupon.maxUses}
                      onChange={(e) => setFormCupon((p) => ({ ...p, maxUses: e.target.value }))}
                      className="w-40 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                      aria-label="Usos máximos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Nombre (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Descuento verano"
                      value={formCupon.name}
                      onChange={(e) => setFormCupon((p) => ({ ...p, name: e.target.value }))}
                      className="w-48 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-6">
                    <input
                      type="checkbox"
                      checked={formCupon.active}
                      onChange={(e) => setFormCupon((p) => ({ ...p, active: e.target.checked }))}
                      className="rounded border-neutral-300 dark:border-neutral-600"
                      aria-label="Activo"
                    />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Activo
                    </span>
                  </label>
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={submittingCupon}
                      className="rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors disabled:opacity-50"
                    >
                      {submittingCupon ? "Guardando…" : editingCuponId ? "Actualizar cupón" : "Guardar cupón"}
                    </button>
                  </div>
                </div>
              </form>
            </section>

            <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
                  Cupones creados
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                      <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                        Código
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                        Tipo
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                        Valor
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                        Vigencia
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                        Usos
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                        Estado
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                    {loadingCupones ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-neutral-500">
                          Cargando…
                        </td>
                      </tr>
                    ) : cupones.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-neutral-500">
                          No hay cupones. Crea uno arriba.
                        </td>
                      </tr>
                    ) : (
                      cupones.map((p) => (
                        <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                          <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">
                            {p.code ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            {p.discountType === "PERCENT" ? "%" : "S/"}
                          </td>
                          <td className="px-4 py-3">{p.value ?? "—"}</td>
                          <td className="px-4 py-3">{formatDate(p.validUntil)}</td>
                          <td className="px-4 py-3">
                            {p.usedCount}
                            {p.maxUses != null ? ` / ${p.maxUses}` : ""}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                p.active
                                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                                  : "bg-neutral-100 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-400"
                              }`}
                            >
                              {p.active ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleEditCupon(p)}
                              className="mr-2 rounded p-1.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                              aria-label="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCupon(p.id)}
                              className="rounded p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              aria-label="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* ——— COMBOS ——— */}
        {activeTab === "combos" && (
          <>
            <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-3">
                <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
                  {editingComboId ? "Editar combo" : "Nuevo combo"}
                </h2>
                {editingComboId && (
                  <button
                    type="button"
                    onClick={resetFormCombo}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <X className="h-4 w-4" /> Cancelar
                  </button>
                )}
              </div>
              <form onSubmit={handleSubmitCombo} className="p-5">
                {errorCombo && (
                  <p className="mb-4 text-sm text-red-600 dark:text-red-400">{errorCombo}</p>
                )}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Combo familiar"
                      value={formCombo.name}
                      onChange={(e) => setFormCombo((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Precio (S/) *
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={formCombo.price}
                      onChange={(e) => setFormCombo((p) => ({ ...p, price: e.target.value }))}
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formCombo.active}
                        onChange={(e) => setFormCombo((p) => ({ ...p, active: e.target.checked }))}
                        className="rounded border-neutral-300 dark:border-neutral-600"
                      />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Activo
                      </span>
                    </label>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Productos del combo
                    </label>
                    <button
                      type="button"
                      onClick={addComboItem}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                    >
                      <Plus className="h-4 w-4" /> Añadir
                    </button>
                  </div>
                  {formCombo.items.length === 0 ? (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Añade productos al combo (opcional).
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {formCombo.items.map((item, index) => (
                        <li
                          key={index}
                          className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-600 p-2"
                        >
                          <select
                            value={item.productId}
                            onChange={(e) =>
                              updateComboItem(index, "productId", parseInt(e.target.value, 10))
                            }
                            className="rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-white min-w-[180px]"
                          >
                            <option value={0}>Seleccionar producto</option>
                            {products.map((prod) => (
                              <option key={prod.id} value={prod.id}>
                                {prod.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateComboItem(index, "quantity", parseInt(e.target.value, 10) || 1)
                            }
                            className="w-20 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => removeComboItem(index)}
                            className="rounded p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            aria-label="Quitar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="mt-5">
                  <button
                    type="submit"
                    disabled={submittingCombo}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors disabled:opacity-50"
                  >
                    {submittingCombo ? "Guardando…" : editingComboId ? "Actualizar combo" : "Guardar combo"}
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-lg font-medium text-neutral-900 dark:text-white">Combos</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                      <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                        Nombre
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                        Precio
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                        Productos
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                        Estado
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                    {loadingCombos ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-neutral-500">
                          Cargando…
                        </td>
                      </tr>
                    ) : combos.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-neutral-500">
                          No hay combos. Crea uno arriba.
                        </td>
                      </tr>
                    ) : (
                      combos.map((c) => (
                        <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                          <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">
                            {c.name}
                          </td>
                          <td className="px-4 py-3">S/ {c.price}</td>
                          <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                            {c.items.length === 0
                              ? "—"
                              : c.items.map((i) => `${i.productName ?? i.productId} x${i.quantity}`).join(", ")}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                c.active
                                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                                  : "bg-neutral-100 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-400"
                              }`}
                            >
                              {c.active ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleEditCombo(c)}
                              className="mr-2 rounded p-1.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                              aria-label="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCombo(c.id)}
                              className="rounded p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              aria-label="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* ——— PROMOCIONES POR TIEMPO ——— */}
        {activeTab === "tiempo" && (
          <>
            <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                  Promociones que aplican en horarios específicos (ej. almuerzo 2x1, happy hour).
                </p>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
                    {editingTiempoId ? "Editar promoción por tiempo" : "Nueva promoción por tiempo"}
                  </h2>
                  {editingTiempoId && (
                    <button
                      type="button"
                      onClick={resetFormTiempo}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      <X className="h-4 w-4" /> Cancelar
                    </button>
                  )}
                </div>
              </div>
              <form onSubmit={handleSubmitTiempo} className="p-5">
                {errorTiempo && (
                  <p className="mb-4 text-sm text-red-600 dark:text-red-400">{errorTiempo}</p>
                )}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Nombre (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Happy hour"
                      value={formTiempo.name}
                      onChange={(e) => setFormTiempo((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Hora inicio (HH:MM)
                    </label>
                    <input
                      type="text"
                      placeholder="12:00"
                      value={formTiempo.timeStart}
                      onChange={(e) => setFormTiempo((p) => ({ ...p, timeStart: e.target.value }))}
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Hora fin (HH:MM)
                    </label>
                    <input
                      type="text"
                      placeholder="14:00"
                      value={formTiempo.timeEnd}
                      onChange={(e) => setFormTiempo((p) => ({ ...p, timeEnd: e.target.value }))}
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Tipo descuento
                    </label>
                    <select
                      value={formTiempo.discountType}
                      onChange={(e) =>
                        setFormTiempo((p) => ({ ...p, discountType: e.target.value as "PERCENT" | "AMOUNT" }))
                      }
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white"
                    >
                      {DISCOUNT_TYPES.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Valor
                    </label>
                    <input
                      type="text"
                      placeholder={formTiempo.discountType === "PERCENT" ? "20" : "5.00"}
                      value={formTiempo.value}
                      onChange={(e) => setFormTiempo((p) => ({ ...p, value: e.target.value }))}
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formTiempo.active}
                        onChange={(e) => setFormTiempo((p) => ({ ...p, active: e.target.checked }))}
                        className="rounded border-neutral-300 dark:border-neutral-600"
                      />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Activo
                      </span>
                    </label>
                  </div>
                </div>
                <div className="mt-5">
                  <button
                    type="submit"
                    disabled={submittingTiempo}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors disabled:opacity-50"
                  >
                    {submittingTiempo ? "Guardando…" : editingTiempoId ? "Actualizar" : "Crear promoción"}
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
                  Promociones por tiempo
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                      <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                        Nombre
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                        Horario
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                        Descuento
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                        Estado
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                    {loadingTiempo ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-neutral-500">
                          Cargando…
                        </td>
                      </tr>
                    ) : promosTiempo.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-neutral-500">
                          No hay promociones por tiempo. Crea una arriba.
                        </td>
                      </tr>
                    ) : (
                      promosTiempo.map((p) => (
                        <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                          <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">
                            {p.name ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                            {p.timeStart && p.timeEnd
                              ? `${p.timeStart} - ${p.timeEnd}`
                              : p.timeStart ?? p.timeEnd ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            {p.value != null && p.discountType
                              ? p.discountType === "PERCENT"
                                ? `${p.value}%`
                                : `S/ ${p.value}`
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                p.active
                                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                                  : "bg-neutral-100 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-400"
                              }`}
                            >
                              {p.active ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleEditTiempo(p)}
                              className="mr-2 rounded p-1.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                              aria-label="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTiempo(p.id)}
                              className="rounded p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              aria-label="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
