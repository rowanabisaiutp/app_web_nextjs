"use client";

import type { ReactNode } from "react";

export type AdminTableColumn<T> = {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  className?: string;
  render?: (row: T) => ReactNode;
};

type AdminTableProps<T> = {
  columns: AdminTableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: ReactNode;
  getRowKey: (row: T) => string | number;
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
  error?: string | null;
};

const alignClass = { left: "text-left", right: "text-right", center: "text-center" };
const thBase = "px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300";
const tdBase = "px-4 py-3";

export function AdminTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage = "No hay registros.",
  getRowKey,
  rowClassName,
  onRowClick,
  error,
}: AdminTableProps<T>) {
  const colCount = columns.length;

  return (
    <div className="overflow-x-auto">
      {error != null && error !== "" && (
        <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-50 dark:bg-neutral-700/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${thBase} ${alignClass[col.align ?? "left"]} ${col.className ?? ""}`.trim()}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
          {loading ? (
            <tr>
              <td
                colSpan={colCount}
                className="px-4 py-12 text-center text-neutral-500 dark:text-neutral-400"
              >
                Cargando…
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={colCount}
                className="px-4 py-12 text-center text-neutral-500 dark:text-neutral-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const key = getRowKey(row);
              const trClass = [
                "hover:bg-neutral-50 dark:hover:bg-neutral-700/30",
                onRowClick ? "cursor-pointer" : "",
                rowClassName?.(row) ?? "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <tr
                  key={key}
                  className={trClass}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => {
                    const content =
                      col.render != null
                        ? col.render(row)
                        : (row[col.key] as ReactNode);
                    const align = col.align ?? "left";
                    return (
                      <td
                        key={col.key}
                        className={`${tdBase} ${alignClass[align]} text-neutral-900 dark:text-white ${col.className ?? ""}`.trim()}
                        onClick={
                          onRowClick
                            ? (e) => {
                                const target = e.target as HTMLElement;
                                if (target.closest("button, a, [role=button]")) e.stopPropagation();
                              }
                            : undefined
                        }
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
