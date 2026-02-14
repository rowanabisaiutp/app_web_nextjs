import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { findUserById } from "@/lib/services/auth.service";
import {
  getSalesByPeriod,
  getTopProducts,
  getRecurringClients,
  getPeakHours,
  getDefaultPeriod,
  getPeriodPreset,
} from "@/lib/services/report.service";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;
  if (!token) return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  const payload = await verifyToken(token);
  if (!payload) return { error: NextResponse.json({ error: "Sesión inválida" }, { status: 401 }) };
  const user = await findUserById(payload.userId);
  if (!user || user.role !== "ADMIN") return { error: NextResponse.json({ error: "Sin permiso" }, { status: 403 }) };
  return { error: null };
}

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
