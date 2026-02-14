"use client";

import {
  CreditCard,
  Banknote,
  Wallet,
  Plus,
  Search,
  Calendar,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { AdminPageHeader, AdminCard, AdminTable } from "@/components/admin";
import { formatDateTime } from "@/lib/utils/format";

const METODOS = [
  { id: "", label: "Todos" },
  { id: "EFECTIVO", label: "Efectivo" },
  { id: "TARJETA", label: "Tarjeta" },
] as const;

type PaymentRow = {
  id: number;
  orderId: number;
  orderTotal: string;
  amount: string;
  method: string;
  status: string;
  createdAt: string;
  clientEmail?: string;
};

const BADGE_STATUS: Record<string, string> = {
  PAGADO: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  PENDIENTE: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  FALLIDO: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
};

function formatMoney(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "0.00";
  return n.toFixed(2);
}

export default function PagosPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOrderId, setFilterOrderId] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [orderIdInput, setOrderIdInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [methodInput, setMethodInput] = useState<"EFECTIVO" | "TARJETA">("EFECTIVO");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      const orderId = filterOrderId.trim() ? parseInt(filterOrderId.trim(), 10) : undefined;
      if (orderId != null && !Number.isNaN(orderId)) params.set("orderId", String(orderId));
      if (filterMethod === "EFECTIVO" || filterMethod === "TARJETA") params.set("method", filterMethod);
      const res = await fetch(`/api/v1/payments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const list = (data.payments ?? []).map((p: PaymentRow & { createdAt?: string }) => ({
          ...p,
          createdAt: typeof p.createdAt === "string" ? p.createdAt : p.createdAt ? new Date(p.createdAt).toISOString() : "",
        }));
        setPayments(list);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error ?? "Error al cargar pagos");
        setPayments([]);
      }
    } catch (e) {
      setError("Error de conexión");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [filterOrderId, filterMethod]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const orderId = orderIdInput.trim() ? parseInt(orderIdInput.trim(), 10) : NaN;
    const amount = amountInput.trim() ? parseFloat(amountInput.trim().replace(",", ".")) : NaN;
    if (Number.isNaN(orderId) || orderId <= 0) {
      setSubmitError("Ingresa un número de pedido válido.");
      return;
    }
    if (Number.isNaN(amount) || amount <= 0) {
      setSubmitError("Ingresa un monto mayor a 0.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, amount, method: methodInput }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setOrderIdInput("");
        setAmountInput("");
        setMethodInput("EFECTIVO");
        fetchPayments();
      } else {
        setSubmitError(data.error ?? "Error al registrar el pago");
      }
    } catch {
      setSubmitError("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toDateString();
  const paymentsToday = payments.filter((p) => new Date(p.createdAt).toDateString() === today);
  const resumenEfectivo = paymentsToday
    .filter((p) => p.method === "EFECTIVO")
    .reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);
  const resumenTarjeta = paymentsToday
    .filter((p) => p.method === "TARJETA")
    .reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);
  const resumenTotal = resumenEfectivo + resumenTarjeta;

  const paymentColumns = [
    { key: "id", label: "#", render: (p: PaymentRow) => p.id },
    { key: "orderId", label: "Pedido", render: (p: PaymentRow) => `#${p.orderId}` },
    {
      key: "clientEmail",
      label: "Cliente",
      render: (p: PaymentRow) => (
        <span className="text-neutral-600 dark:text-neutral-400">{p.clientEmail ?? "—"}</span>
      ),
    },
    {
      key: "amount",
      label: "Monto",
      align: "right" as const,
      render: (p: PaymentRow) => (
        <span className="font-medium text-neutral-900 dark:text-white">
          S/ {formatMoney(p.amount)}
        </span>
      ),
    },
    {
      key: "method",
      label: "Método",
      render: (p: PaymentRow) =>
        p.method === "EFECTIVO" ? "Efectivo" : "Tarjeta",
    },
    {
      key: "createdAt",
      label: "Fecha",
      render: (p: PaymentRow) => (
        <span className="text-neutral-600 dark:text-neutral-400">
          {formatDateTime(p.createdAt)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: (p: PaymentRow) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            BADGE_STATUS[p.status] ??
            "bg-neutral-100 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300"
          }`}
        >
          {p.status}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <AdminPageHeader
        icon={<CreditCard aria-hidden />}
        title="Pagos"
        description="Registro de pagos en efectivo o tarjeta"
      />

      <div className="space-y-6">
        <AdminCard title="Métodos de pago" icon={<Wallet aria-hidden />}>
          <div className="p-5 flex flex-wrap gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-neutral-200 dark:border-neutral-600 px-5 py-4 bg-neutral-50 dark:bg-neutral-700/30 min-w-[180px]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                <Banknote className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">Efectivo</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Pago en efectivo</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-neutral-200 dark:border-neutral-600 px-5 py-4 bg-neutral-50 dark:bg-neutral-700/30 min-w-[180px]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <CreditCard className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">Tarjeta</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Débito o crédito</p>
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Registrar pago" icon={<Plus aria-hidden />}>
          <div className="p-5">
            <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="pago-orderId" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  N.º de pedido
                </label>
                <input
                  id="pago-orderId"
                  type="number"
                  min={1}
                  placeholder="Ej. 42"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  aria-label="Número de pedido"
                />
              </div>
              <div>
                <label htmlFor="pago-amount" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Monto (S/)
                </label>
                <input
                  id="pago-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  aria-label="Monto"
                />
              </div>
              <div>
                <label htmlFor="pago-method" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Método de pago
                </label>
                <select
                  id="pago-method"
                  value={methodInput}
                  onChange={(e) => setMethodInput(e.target.value as "EFECTIVO" | "TARJETA")}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white"
                  aria-label="Método de pago"
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TARJETA">Tarjeta</option>
                </select>
              </div>
              <div className="flex flex-col justify-end gap-1">
                {submitError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Registrando…" : "Registrar pago"}
                </button>
              </div>
            </form>
          </div>
        </AdminCard>

        <AdminCard
          title="Registro de pagos"
          headerAction={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-40">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                  aria-hidden
                />
                <input
                  type="text"
                  placeholder="N.º pedido"
                  value={filterOrderId}
                  onChange={(e) => setFilterOrderId(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-400"
                  aria-label="Filtrar por número de pedido"
                />
              </div>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                aria-label="Filtrar por método"
              >
                {METODOS.map((m) => (
                  <option key={m.id || "todos"} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          }
          headerBetween
        >
          <AdminTable<PaymentRow>
            columns={paymentColumns}
            data={payments}
            loading={loading}
            emptyMessage="No hay pagos registrados. Registra un pago desde el formulario de arriba."
            getRowKey={(p) => p.id}
            error={error}
          />
        </AdminCard>

        <AdminCard title="Resumen del día" icon={<Calendar aria-hidden />}>
          <div className="p-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 p-4">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Efectivo</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-white mt-1">S/ {formatMoney(resumenEfectivo)}</p>
            </div>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 p-4">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Tarjeta</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-white mt-1">S/ {formatMoney(resumenTarjeta)}</p>
            </div>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 p-4">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Total</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-white mt-1">S/ {formatMoney(resumenTotal)}</p>
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
