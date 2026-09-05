import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/requireAdmin";
import {
  getSalesByPeriod,
  getTopProducts,
  getRecurringClients,
  getPeakHours,
  getDefaultPeriod,
  getPeriodPreset,
} from "@/lib/services/report.service";

/**
 * GET /api/v1/reports — Reportes agregados.
 * Query: from (YYYY-MM-DD), to (YYYY-MM-DD), o preset (hoy|semana|mes)
 */
export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const preset = searchParams.get("preset") as "hoy" | "semana" | "mes" | null;
  let from = searchParams.get("from") ?? "";
  let to = searchParams.get("to") ?? "";

  if (preset === "hoy" || preset === "semana" || preset === "mes") {
    const range = getPeriodPreset(preset);
    from = range.from;
    to = range.to;
  } else if (!from || !to) {
    const defaultRange = getDefaultPeriod();
    from = defaultRange.from;
    to = defaultRange.to;
  }

  try {
    const [sales, topProducts, recurringClients, peakHours] = await Promise.all([
      getSalesByPeriod(from, to),
      getTopProducts(from, to),
      getRecurringClients(from, to),
      getPeakHours(from, to),
    ]);

    return NextResponse.json({
      from,
      to,
      sales,
      topProducts,
      recurringClients,
      peakHours,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al generar reportes";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
