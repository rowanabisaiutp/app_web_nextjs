import {
  Tag,
  Ticket,
  Package,
  Clock,
  Plus,
} from "lucide-react";

export default function PromocionesPage() {
  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex items-center gap-3">
        <Tag className="h-8 w-8 text-neutral-500 dark:text-neutral-400" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Promociones y descuentos
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Cupones, combos y promociones por tiempo (solo diseño)
          </p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Creación de cupones */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Ticket className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
                Creación de cupones
              </h2>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
            >
              <Plus className="h-4 w-4" aria-hidden /> Nuevo cupón
            </button>
          </div>
          <div className="p-5">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Código del cupón
                </label>
                <input
                  type="text"
                  placeholder="Ej. VERANO20"
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  readOnly
                  aria-label="Código"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Tipo de descuento
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white"
                  defaultValue=""
                  aria-label="Tipo"
                >
                  <option value="">Seleccionar</option>
                  <option value="porcentaje">Porcentaje (%)</option>
                  <option value="monto">Monto fijo (S/)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Valor
                </label>
                <input
                  type="text"
                  placeholder="Ej. 20 o 5.00"
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  readOnly
                  aria-label="Valor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Vigencia hasta
                </label>
                <input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  readOnly
                  aria-label="Vigencia"
                />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Usos máximos (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. 100 o vacío = ilimitado"
                  className="w-40 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  readOnly
                  aria-label="Usos máximos"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-neutral-300 dark:border-neutral-600" defaultChecked readOnly aria-label="Activo" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Activo</span>
              </label>
              <button
                type="button"
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
              >
                Guardar cupón
              </button>
            </div>
          </div>
        </section>

        {/* Lista de cupones */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Cupones creados
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Código</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Valor</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Vigencia</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Usos</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    No hay cupones creados. Los datos se cargarán cuando conectes la API.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Combos */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
                Combos
              </h2>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
            >
              <Plus className="h-4 w-4" aria-hidden /> Nuevo combo
            </button>
          </div>
          <div className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 py-8 text-center">
              No hay combos. Los datos se cargarán cuando conectes la API.
            </p>
          </div>
        </section>

        {/* Promociones por tiempo */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
                Promociones por tiempo
              </h2>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
            >
              <Plus className="h-4 w-4" aria-hidden /> Nueva promoción
            </button>
          </div>
          <div className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Promociones que aplican en horarios específicos (ej. almuerzo 2x1, happy hour).
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 py-8 text-center">
              No hay promociones por tiempo. Los datos se cargarán cuando conectes la API.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
