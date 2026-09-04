"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import AdminAssistant from "@/components/admin/dashboard/AdminAssistant";

export default function FloatingAssistant() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-8rem)] rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-neutral-500 dark:text-neutral-400" aria-hidden />
              <h2 className="text-sm font-medium text-neutral-900 dark:text-white">Asistente IA</h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              aria-label="Cerrar asistente"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <AdminAssistant />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 shadow-xl hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
        aria-label={open ? "Cerrar asistente" : "Abrir asistente"}
      >
        {open ? <X className="h-6 w-6" aria-hidden /> : <Sparkles className="h-6 w-6" aria-hidden />}
      </button>
    </>
  );
}
