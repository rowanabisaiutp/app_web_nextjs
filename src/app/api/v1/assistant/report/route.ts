import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/requireAdmin";
import {
  generateReportFile,
  type ReportFormat,
  type ReportKind,
} from "@/lib/services/reportFile.service";

const VALID_FORMATS: ReportFormat[] = ["pdf", "word", "excel", "image"];
const VALID_KINDS: ReportKind[] = ["summary", "orders", "products", "clients"];

/**
 * GET /api/v1/assistant/report?format=pdf&kind=summary — Genera y descarga
 * un reporte con datos reales. Solo ADMIN.
 */
export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") as ReportFormat | null;
  const kind = (searchParams.get("kind") as ReportKind | null) ?? "summary";

  if (!format || !VALID_FORMATS.includes(format)) {
    return NextResponse.json({ error: "Formato inválido (usa pdf, word, excel o image)" }, { status: 400 });
  }
  if (!VALID_KINDS.includes(kind)) {
    return NextResponse.json({ error: "Tipo de reporte inválido" }, { status: 400 });
  }

  try {
    const { buffer, contentType, filename } = await generateReportFile(kind, format);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al generar el reporte";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
