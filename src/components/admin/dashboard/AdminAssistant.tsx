"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Download } from "lucide-react";

type Download = { url: string; format: string };
type Message = { role: "user" | "assistant"; content: string; download?: Download };

const SUGGESTIONS = [
  "¿Cómo van las ventas de hoy?",
  "¿Cuáles son mis productos más vendidos este mes?",
  "Genera un reporte de pedidos en excel",
  "Descarga un PDF con el resumen del negocio",
];

const FORMAT_EXT: Record<string, string> = {
  pdf: "pdf",
  word: "docx",
  excel: "xlsx",
  image: "png",
};

export default function AdminAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || loading) return;

    const next: Message[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al consultar la IA");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, download: data.download },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al consultar la IA");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={listRef}>
        {messages.length === 0 && !loading && (
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
              Pregúntale sobre tus ventas, pedidos o productos, o pídele un reporte descargable.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="rounded-full border border-neutral-200 dark:border-neutral-600 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800"
                  : "bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100"
              }`}
            >
              <p>{m.content}</p>
              {m.download && (
                <a
                  href={m.download.url}
                  download
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  Descargar .{FORMAT_EXT[m.download.format] ?? "archivo"}
                </a>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg px-3.5 py-2.5 bg-neutral-100 dark:bg-neutral-700">
              <Loader2 className="h-4 w-4 animate-spin text-neutral-500" aria-hidden />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-800 dark:text-red-200">
            {error}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="flex items-center gap-2 border-t border-neutral-200 dark:border-neutral-700 p-3 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta…"
          disabled={loading}
          className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 disabled:opacity-60"
          aria-label="Mensaje para el asistente"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="inline-flex items-center justify-center rounded-lg bg-neutral-800 dark:bg-neutral-200 h-10 w-10 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors disabled:opacity-50 shrink-0"
          aria-label="Enviar"
        >
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}
