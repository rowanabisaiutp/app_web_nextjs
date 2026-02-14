"use client";

import { useState, useEffect, useCallback } from "react";
import { ScrollText, History, RefreshCw, Search, Filter, Calendar } from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminTable,
  AdminPagination,
} from "@/components/admin";
import { formatDateTime } from "@/lib/utils/format";

type LogRow = {
  id: number;
  userId: number | null;
  userEmail: string | null;
  userName: string | null;
  action: string;
  resourceType: string;
  resourceId: number | null;
  detail: string | null;
  oldValue: string | null;
  newValue: string | null;
  logType: string | null;
  createdAt: string;
};

const LOG_TYPE_LABELS: Record<string, string> = {
  ACTION: "Acción",
  STATE_CHANGE: "Cambio de estado",
  ERROR: "Error",
};

const LOG_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "todos", label: "Todos los tipos" },
  { value: "ACTION", label: "Acción" },
  { value: "STATE_CHANGE", label: "Cambio de estado" },
  { value: "ERROR", label: "Error" },
];

function userLabel(row: LogRow): string {
  return row.userName?.trim() || row.userEmail?.trim() || "—";
}

export default function LogsPage() {
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [logType, setLogType] = useState<string>("todos");
  const [page, setPage] = useState(1);
  const limit = 25;

  const [logs, setLogs] = useState<LogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (logType !== "todos") params.set("logType", logType);
      params.set("page", String(page));
      params.set("limit", String(limit));

      const res = await fetch(`/api/v1/audit-logs?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al cargar logs");
        setLogs([]);
        setTotal(0);
        return;
      }
      const rawLogs = data.logs ?? [];
      setLogs(
        rawLogs.map((l: Record<string, unknown>) => ({
          ...l,
          createdAt:
            l.createdAt == null
              ? ""
              : typeof l.createdAt === "string"
                ? l.createdAt
                : String(l.createdAt),
        })) as LogRow[]
      );
      setTotal(data.total ?? 0);
    } catch {
      setError("Error de conexión");
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, from, to, logType, page, limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const logColumns = [
    {
      key: "createdAt",
      label: "Fecha / Hora",
      className: "whitespace-nowrap text-neutral-600 dark:text-neutral-400",
      render: (row: LogRow) => formatDateTime(row.createdAt),
    },
    {
      key: "user",
      label: "Usuario",
      render: (row: LogRow) => userLabel(row),
    },
    {
      key: "logType",
      label: "Tipo",
      render: (row: LogRow) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            row.logType === "ERROR"
              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
              : row.logType === "STATE_CHANGE"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                : "bg-neutral-100 text-neutral-700 dark:bg-neutral-600 dark:text-neutral-300"
          }`}
        >
          {LOG_TYPE_LABELS[row.logType ?? ""] ?? row.logType ?? "—"}
        </span>
      ),
    },
    {
      key: "action",
      label: "Acción",
      className: "max-w-[180px] truncate",
      render: (row: LogRow) => row.action || "—",
    },
    {
      key: "resource",
      label: "Recurso",
      className: "text-neutral-600 dark:text-neutral-400",
      render: (row: LogRow) =>
        `${row.resourceType}${row.resourceId != null ? ` #${row.resourceId}` : ""}`,
    },
    {
      key: "detail",
      label: "Detalle",
      className: "max-w-[240px] truncate text-neutral-600 dark:text-neutral-400",
      render: (row: LogRow) =>
        row.detail ??
        (row.oldValue || row.newValue
          ? `${row.oldValue ?? "—"} → ${row.newValue ?? "—"}`
          : "—"),
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <AdminPageHeader
        icon={<ScrollText aria-hidden />}
        title="Logs y auditoría"
        description="Historial de acciones, cambios de estado y errores del sistema"
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
                placeholder="Buscar por acción, recurso o usuario..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-400"
                aria-label="Buscar"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neutral-400" aria-hidden />
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-36 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                aria-label="Fecha desde"
              />
              <span className="text-neutral-400">—</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-36 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                aria-label="Fecha hasta"
              />
            </div>
            <select
              value={logType}
              onChange={(e) => setLogType(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              aria-label="Tipo de log"
            >
              {LOG_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => fetchLogs()}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                aria-hidden
              />
              Actualizar
            </button>
          </div>
        </AdminCard>

        <AdminCard title="Historial de auditoría" icon={<History aria-hidden />}>
          <AdminTable<LogRow>
            columns={logColumns}
            data={logs}
            loading={loading}
            emptyMessage="No hay registros con los filtros aplicados."
            getRowKey={(row) => row.id}
            error={error}
          />
          {total > 0 && (
            <AdminPagination
              total={total}
              page={page}
              limit={limit}
              onPageChange={setPage}
              loading={loading}
            />
          )}
        </AdminCard>
      </div>
    </div>
  );
}
