"use client";

import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  DollarSign,
  ClipboardList,
  Receipt,
  Package,
  Users,
  Clock,
  Download,
} from "lucide-react";
import { AdminPageHeader, AdminCard, AdminTable } from "@/components/admin";
import type { AdminTableColumn } from "@/components/admin";
import { formatDateTime } from "@/lib/utils/format";

type Preset = "hoy" | "semana" | "mes";

const PERIODS: { id: Preset; label: string }[] = [
  { id: "hoy", label: "Hoy" },
  { id: "semana", label: "Semana" },
  { id: "mes", label: "Mes" },
];

const DOWNLOADS: { format: "pdf" | "word" | "excel" | "image"; label: string }[] = [
  { format: "pdf", label: "Descargar resumen (PDF)" },
  { format: "excel", label: "Descargar resumen (Excel)" },
  { format: "word", label: "Descargar resumen (Word)" },
  { format: "image", label: "Descargar resumen (Imagen)" },
];

type SalesSummary = {
  totalSales: string;
  orderCount: number;
  averageTicket: string;
};

type TopProductRow = {
  productName: string;
  quantity: number;
  revenue: string;
};

type RecurringClientRow = {
  clientId: number;
  clientName: string | null;
  clientEmail: string;
  orderCount: number;
  lastOrderAt: string;
};

type PeakHourRow = {
  hour: number;
  hourLabel: string;
  count: number;
};

type ReportData = {
  from: string;
  to: string;
  sales: SalesSummary;
  topProducts: TopProductRow[];
  recurringClients: RecurringClientRow[];
  peakHours: PeakHourRow[];
};

function formatMoney(value: string | number | undefined): string {
  const n = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  if (Number.isNaN(n)) return "0.00";
  return n.toFixed(2);
}

export default function ReportesPage() {
  const [period, setPeriod] = useState<Preset>("mes");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async (preset: Preset) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/reports?preset=${preset}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error ?? "Error al cargar los reportes");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(period);
  }, [period, fetchReport]);

  const productColumns: AdminTableColumn<TopProductRow>[] = [
    {
      key: "productName",
      label: "Producto",
      render: (p) => (
        <span className="font-medium text-neutral-900 dark:text-white">{p.productName}</span>
      ),
    },
    {
      key: "quantity",
      label: "Cantidad",
      align: "right",
      render: (p) => p.quantity,
    },
    {
      key: "revenue",
      label: "Ingresos",
      align: "right",
      render: (p) => <span>S/ {formatMoney(p.revenue)}</span>,
    },
  ];

  const clientColumns: AdminTableColumn<RecurringClientRow>[] = [
    {
      key: "client",
      label: "Cliente",
      render: (c) => (
        <span className="text-neutral-900 dark:text-white">{c.clientName || c.clientEmail}</span>
      ),
    },
    {
      key: "orderCount",
      label: "Pedidos",
      align: "right",
      render: (c) => c.orderCount,
    },
    {
      key: "lastOrderAt",
      label: "Último pedido",
      align: "right",
      render: (c) => (
        <span className="text-neutral-600 dark:text-neutral-400">
          {formatDateTime(c.lastOrderAt)}
        </span>
      ),
    },
  ];

  const peakHours = data?.peakHours ?? [];
  const maxHourCount = Math.max(1, ...peakHours.map((h) => h.count));

  return (
    <div className="p-6 lg:p-8">
      <AdminPageHeader
        icon={<TrendingUp aria-hidden />}
        title="Reportes y métricas"
        description="Ventas, productos, clientes recurrentes y horarios pico del negocio"
      />

      <div className="space-y-6">
        <AdminCard title="Periodo">
          <div className="p-5 flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  period === p.id
                    ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-800"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                }`}
              >
                {p.label}
              </button>
            ))}
            {data && (
              <span className="ml-auto self-center text-xs text-neutral-500 dark:text-neutral-400">
                {data.from} — {data.to}
              </span>
            )}
          </div>
        </AdminCard>

        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        <AdminCard title="Resumen de ventas" icon={<DollarSign aria-hidden />}>
          <div className="p-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 p-4">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Total vendido
              </p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white mt-1">
                {loading && !data ? "—" : `S/ ${formatMoney(data?.sales.totalSales)}`}
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 p-4">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Pedidos
              </p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white mt-1 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-neutral-400" aria-hidden />
                {loading && !data ? "—" : (data?.sales.orderCount ?? 0)}
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 p-4">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Ticket promedio
              </p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-white mt-1 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-neutral-400" aria-hidden />
                {loading && !data ? "—" : `S/ ${formatMoney(data?.sales.averageTicket)}`}
              </p>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Productos más vendidos" icon={<Package aria-hidden />}>
          <AdminTable<TopProductRow>
            columns={productColumns}
            data={data?.topProducts ?? []}
            loading={loading}
            emptyMessage="No hay ventas de productos en este periodo."
            getRowKey={(p) => p.productName}
          />
        </AdminCard>

        <AdminCard title="Clientes recurrentes" icon={<Users aria-hidden />}>
          <AdminTable<RecurringClientRow>
            columns={clientColumns}
            data={data?.recurringClients ?? []}
            loading={loading}
            emptyMessage="No hay clientes recurrentes en este periodo."
            getRowKey={(c) => c.clientId}
          />
        </AdminCard>

        <AdminCard
          title="Horarios pico"
          icon={<Clock aria-hidden />}
          subtitle="Cantidad de pedidos por hora del día"
        >
          <div className="p-5">
            {loading && !data ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Cargando…</p>
            ) : peakHours.every((h) => h.count === 0) ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No hay pedidos registrados en este periodo.
              </p>
            ) : (
              <div className="space-y-1.5">
                {peakHours.map((h) => (
                  <div key={h.hour} className="flex items-center gap-3">
                    <span className="w-12 shrink-0 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      {h.hourLabel}
                    </span>
                    <div className="flex-1 h-4 rounded bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
                      <div
                        className="h-full rounded bg-neutral-800 dark:bg-neutral-300"
                        style={{ width: `${(h.count / maxHourCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-xs text-neutral-500 dark:text-neutral-400">
                      {h.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AdminCard>

        <AdminCard
          title="Descargar reportes"
          icon={<Download aria-hidden />}
          subtitle="Genera y descarga el resumen de reportes en distintos formatos"
        >
          <div className="p-5 flex flex-wrap gap-3">
            {DOWNLOADS.map((d) => (
              <a
                key={d.format}
                href={`/api/v1/assistant/report?format=${d.format}&kind=summary`}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
              >
                <Download className="h-4 w-4" aria-hidden />
                {d.label}
              </a>
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
