import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/requireAdmin";
import {
  askAssistant,
  detectReportIntent,
  describeReportIntent,
  type ChatMessage,
} from "@/lib/services/assistant.service";

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

/**
 * POST /api/v1/assistant — Chat con el asistente de IA (NVIDIA NIM).
 * Body: { messages: { role: "user" | "assistant", content: string }[] }
 */
export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "Se requiere al menos un mensaje" }, { status: 400 });
  }

  const messages: ChatMessage[] = [];
  for (const m of body.messages.slice(-MAX_MESSAGES)) {
    if (
      !m ||
      typeof m !== "object" ||
      (m.role !== "user" && m.role !== "assistant") ||
      typeof m.content !== "string" ||
      m.content.length === 0
    ) {
      return NextResponse.json({ error: "Formato de mensaje inválido" }, { status: 400 });
    }
    messages.push({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) });
  }

  const lastMessage = messages[messages.length - 1];
  const intent = lastMessage.role === "user" ? detectReportIntent(lastMessage.content) : null;

  if (intent) {
    const params = new URLSearchParams({ format: intent.format, kind: intent.kind });
    return NextResponse.json({
      reply: describeReportIntent(intent),
      download: {
        url: `/api/v1/assistant/report?${params.toString()}`,
        format: intent.format,
      },
    });
  }

  try {
    const reply = await askAssistant(messages);
    return NextResponse.json({ reply });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al consultar la IA";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
