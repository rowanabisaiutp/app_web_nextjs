const LOCALE = "es-PE";

/**
 * Formatea una fecha ISO o Date a string corto (solo fecha).
 */
export function formatDateShort(iso: string | Date | null | undefined): string {
  if (iso == null || iso === "") return "—";
  try {
    const d = typeof iso === "string" ? new Date(iso) : iso;
    return d.toLocaleDateString(LOCALE, { dateStyle: "short" });
  } catch {
    return String(iso);
  }
}

/**
 * Formatea una fecha ISO o Date a string con fecha y hora.
 */
export function formatDateTime(iso: string | Date | null | undefined): string {
  if (iso == null || iso === "") return "—";
  try {
    const d = typeof iso === "string" ? new Date(iso) : iso;
    return d.toLocaleString(LOCALE, { dateStyle: "short", timeStyle: "short" });
  } catch {
    return String(iso);
  }
}

/**
 * Alias para compatibilidad: misma salida que formatDateTime.
 */
export function formatDate(iso: string | Date | null | undefined): string {
  return formatDateTime(iso);
}
