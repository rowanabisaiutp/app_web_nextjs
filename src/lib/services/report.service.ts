import { prisma } from "@/lib/prisma";

export type SalesByPeriodResult = {
  totalSales: string;
  orderCount: number;
  averageTicket: string;
};

export type TopProductRow = {
  productName: string;
  productId: number | null;
  quantity: number;
  revenue: string;
};

export type RecurringClientRow = {
  clientId: number;
  clientName: string | null;
  clientEmail: string;
  orderCount: number;
  lastOrderAt: Date;
};

export type PeakHourRow = {
  hour: number;
  hourLabel: string;
  count: number;
};

/**
 * Calcula el rango de fechas para el periodo.
 * from/to en formato YYYY-MM-DD; se interpretan en hora local del servidor.
 */
function getDateRange(from: string, to: string): { dateFrom: Date; dateTo: Date } {
  const dateFrom = new Date(from + "T00:00:00");
  const dateTo = new Date(to + "T23:59:59.999");
  return { dateFrom, dateTo };
}

/**
 * Ventas por periodo: total vendido, cantidad de pedidos, ticket promedio.
 */
export async function getSalesByPeriod(
  from: string,
  to: string
): Promise<SalesByPeriodResult> {
  const { dateFrom, dateTo } = getDateRange(from, to);

  const [agg, count] = await Promise.all([
    prisma.order.aggregate({
      where: {
        createdAt: { gte: dateFrom, lte: dateTo },
        status: { not: "CANCELADO" },
      },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: dateFrom, lte: dateTo },
        status: { not: "CANCELADO" },
      },
    }),
  ]);

  const total = agg._sum.total != null ? Number(agg._sum.total) : 0;
  const averageTicket = count > 0 ? total / count : 0;

  return {
    totalSales: total.toFixed(2),
    orderCount: count,
    averageTicket: averageTicket.toFixed(2),
  };
}

/**
 * Productos más vendidos en el periodo (por cantidad).
 */
export async function getTopProducts(
  from: string,
  to: string,
  limit = 20
): Promise<TopProductRow[]> {
  const { dateFrom, dateTo } = getDateRange(from, to);

  const items = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: { gte: dateFrom, lte: dateTo },
        status: { not: "CANCELADO" },
      },
    },
    select: {
      productName: true,
      productId: true,
      quantity: true,
      unitPrice: true,
    },
  });

  const byProduct = new Map<
    string,
    { productName: string; productId: number | null; quantity: number; revenue: number }
  >();

  for (const i of items) {
    const key = i.productId != null ? String(i.productId) : i.productName;
    const unitPrice = Number(i.unitPrice);
    const subtotal = unitPrice * i.quantity;
    const existing = byProduct.get(key);
    if (existing) {
      existing.quantity += i.quantity;
      existing.revenue += subtotal;
    } else {
      byProduct.set(key, {
        productName: i.productName,
        productId: i.productId,
        quantity: i.quantity,
        revenue: subtotal,
      });
    }
  }

  const sorted = Array.from(byProduct.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);

  return sorted.map((r) => ({
    productName: r.productName,
    productId: r.productId,
    quantity: r.quantity,
    revenue: r.revenue.toFixed(2),
  }));
}

/**
 * Clientes recurrentes en el periodo: más pedidos primero.
 */
export async function getRecurringClients(
  from: string,
  to: string,
  limit = 20
): Promise<RecurringClientRow[]> {
  const { dateFrom, dateTo } = getDateRange(from, to);

  const grouped = await prisma.order.groupBy({
    by: ["clientId"],
    where: {
      createdAt: { gte: dateFrom, lte: dateTo },
      status: { not: "CANCELADO" },
    },
    _count: true,
    _max: { createdAt: true },
  });

  if (grouped.length === 0) return [];

  const clientIds = grouped.map((g) => g.clientId);
  const clients = await prisma.client.findMany({
    where: { id: { in: clientIds } },
    select: { id: true, name: true, email: true },
  });
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));

  const rows: RecurringClientRow[] = grouped
    .map((g) => {
      const client = clientMap[g.clientId];
      if (!client) return null;
      return {
        clientId: g.clientId,
        clientName: client.name ?? null,
        clientEmail: client.email,
        orderCount: g._count,
        lastOrderAt: g._max.createdAt!,
      };
    })
    .filter((r): r is RecurringClientRow => r != null)
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, limit);

  return rows;
}

/**
 * Horarios pico: cantidad de pedidos por hora (0-23).
 */
export async function getPeakHours(from: string, to: string): Promise<PeakHourRow[]> {
  const { dateFrom, dateTo } = getDateRange(from, to);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: dateFrom, lte: dateTo },
      status: { not: "CANCELADO" },
    },
    select: { createdAt: true },
  });

  const byHour = new Array<number>(24).fill(0);
  for (const o of orders) {
    const h = new Date(o.createdAt).getHours();
    byHour[h]++;
  }

  return byHour.map((count, hour) => ({
    hour,
    hourLabel: `${String(hour).padStart(2, "0")}:00`,
    count,
  }));
}

function formatDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Devuelve from/to por defecto para "este mes" (inicio y fin del mes actual en local).
 */
export function getDefaultPeriod(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: formatDateLocal(from), to: formatDateLocal(to) };
}

/**
 * Calcula from/to para presets: hoy, semana, mes.
 */
export function getPeriodPreset(
  preset: "hoy" | "semana" | "mes"
): { from: string; to: string } {
  const now = new Date();
  let from: Date;
  let to: Date;

  if (preset === "hoy") {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    to = new Date(from);
    to.setHours(23, 59, 59, 999);
  } else if (preset === "semana") {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    from = new Date(now.getFullYear(), now.getMonth(), diff);
    to = new Date(from);
    to.setDate(to.getDate() + 6);
    to.setHours(23, 59, 59, 999);
  } else {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
    to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    to.setHours(23, 59, 59, 999);
  }

  return { from: formatDateLocal(from), to: formatDateLocal(to) };
}
