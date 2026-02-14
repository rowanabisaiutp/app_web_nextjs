"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type AdminPaginationProps = {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
};

export function AdminPagination({
  total,
  page,
  limit,
  onPageChange,
  loading = false,
}: AdminPaginationProps) {
  if (total <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 px-4 py-3 dark:border-neutral-700">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Mostrando {from}–{to} de {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={!hasPrev || loading}
          className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Anterior
        </button>
        <span className="px-2 text-sm text-neutral-500 dark:text-neutral-400">
          Página {page} de {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={!hasNext || loading}
          className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
