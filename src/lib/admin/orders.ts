import { formatDateTime } from "@/lib/utils/format";

/** Opciones de estado de pedido para filtros y selects */
export const ORDER_STATUS_OPTIONS = [
  { id: "todos", label: "Todos" },
  { id: "CONFIRMADO", label: "Confirmado" },
  { id: "EN_PREPARACION", label: "En preparación" },
  { id: "LISTO", label: "Listo" },
  { id: "ENTREGADO", label: "Entregado" },
  { id: "CANCELADO", label: "Cancelado" },
] as const;

/** Clases CSS para badge de estado (pedidos/entregas) */
export const ORDER_STATUS_BADGE: Record<string, string> = {
  CONFIRMADO: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  EN_PREPARACION: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  LISTO: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  ENTREGADO: "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300",
  CANCELADO: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
};

export type OrderRow = {
  id: number;
  clientId: number;
  clientName: string | null;
  clientEmail: string;
  status: string;
  total: string;
  deliveryType: string;
  createdAt: string;
  deliveryAddress?: string | null;
};

export type OrderItemRow = {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
};

export type OrderDetailRow = OrderRow & {
  deliveryAddress: string | null;
  notes: string | null;
  items: OrderItemRow[];
  updatedAt: string;
};

/** Normaliza un pedido de la API (lista): convierte createdAt a string formateado */
export function formatOrderFromApi<T extends { createdAt?: string | Date }>(
  o: T
): T & { createdAt: string } {
  const createdAt =
    typeof o.createdAt === "string"
      ? o.createdAt
      : o.createdAt
        ? formatDateTime(o.createdAt)
        : "";
  return { ...o, createdAt } as T & { createdAt: string };
}

/** Normaliza un pedido detalle de la API: createdAt y updatedAt a string */
export function formatOrderDetailFromApi<
  T extends { createdAt?: string | Date; updatedAt?: string | Date }
>(o: T): T & { createdAt: string; updatedAt: string } {
  const createdAt =
    typeof o.createdAt === "string"
      ? o.createdAt
      : o.createdAt
        ? formatDateTime(o.createdAt)
        : "";
  const updatedAt =
    typeof o.updatedAt === "string"
      ? o.updatedAt
      : o.updatedAt
        ? formatDateTime(o.updatedAt)
        : "";
  return { ...o, createdAt, updatedAt } as T & {
    createdAt: string;
    updatedAt: string;
  };
}
