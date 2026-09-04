import { prisma } from "@/lib/prisma";
import {
  getSalesByPeriod,
  getTopProducts,
  getPeriodPreset,
} from "@/lib/services/report.service";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-20b";

export type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Arma un resumen del negocio (ventas, pedidos, productos top) para dar
 * contexto real a la IA. Se reconstruye en cada request: los datos siempre
 * están al día.
 */
async function buildBusinessContext(): Promise<string> {
  const today = getPeriodPreset("hoy");
  const month = getPeriodPreset("mes");

  const [salesToday, salesMonth, topProducts, ordersByStatus, clientCount, businessCount] =
    await Promise.all([
      getSalesByPeriod(today.from, today.to),
      getSalesByPeriod(month.from, month.to),
      getTopProducts(month.from, month.to, 5),
      prisma.order.groupBy({ by: ["status"], _count: true }),
      prisma.client.count(),
      prisma.business.count(),
    ]);

  const statusLines = ordersByStatus
    .map((s) => `  - ${s.status}: ${s._count}`)
    .join("\n");

  const topProductsLines =
    topProducts.length > 0
      ? topProducts
          .map((p, i) => `  ${i + 1}. ${p.productName} — ${p.quantity} unidades, $${p.revenue}`)
          .join("\n")
      : "  (sin ventas registradas este mes)";

  return `Datos actuales del negocio (moneda local, generados en este momento):

Ventas de hoy: $${salesToday.totalSales} en ${salesToday.orderCount} pedidos (ticket promedio $${salesToday.averageTicket})
Ventas del mes: $${salesMonth.totalSales} en ${salesMonth.orderCount} pedidos (ticket promedio $${salesMonth.averageTicket})

Pedidos por estado (histórico total):
${statusLines || "  (sin pedidos)"}

Productos más vendidos este mes:
${topProductsLines}

Clientes registrados: ${clientCount}
Negocios/sucursales registrados: ${businessCount}`;
}

const SYSTEM_PROMPT = `Eres el asistente del panel administrativo de un negocio de comida/restaurante.
Respondes en español, de forma breve y directa, basándote SOLO en los datos que se te dan a continuación.
Si te preguntan algo que no puedes responder con estos datos, dilo claramente en vez de inventar números.
No inventes cifras ni nombres de productos/clientes que no aparezcan en el contexto.`;

export async function askAssistant(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.NVIDIA_KEY;
  if (!apiKey) {
    throw new Error("Falta configurar NVIDIA_KEY en el servidor.");
  }

  const context = await buildBusinessContext();

  const res = await fetch(NVIDIA_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.NVIDIA_MODEL || DEFAULT_MODEL,
      messages: [
        { role: "system", content: `${SYSTEM_PROMPT}\n\n${context}` },
        ...messages,
      ],
      temperature: 0.3,
      max_tokens: 600,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`NVIDIA API error ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content;
  if (typeof reply !== "string") {
    throw new Error("Respuesta inesperada de la IA.");
  }
  return reply;
}
