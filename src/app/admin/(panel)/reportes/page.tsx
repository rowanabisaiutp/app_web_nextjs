import {
  TrendingUp,
  BarChart3,
  Package,
  Users,
  Clock,
  FileDown,
  FileSpreadsheet,
  Calendar,
  DollarSign,
} from "lucide-react";

export default function ReportesPage() {
  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex items-center gap-3">
        <TrendingUp className="h-8 w-8 text-neutral-500 dark:text-neutral-400" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Reportes y métricas
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Ventas por periodo, productos más vendidos, clientes recurrentes y horarios pico (solo diseño)
          </p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Ventas por periodo */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
                Ventas por periodo
              </h2>
            </div>
            <select
              className="rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2 text-sm text-neutral-900 dark:text-white"
              defaultValue="mes"
              aria-label="Periodo"
            >
              <option value="hoy">Hoy</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
            </select>
          </div>
          <div className="p-5">
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 p-4">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" aria-hidden /> Total ventas
                </p>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-white mt-1">S/ 0.00</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Los datos se cargarán cuando conectes la API.</p>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 p-4">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Pedidos</p>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-white mt-1">0</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Los datos se cargarán cuando conectes la API.</p>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 p-4">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Ticket promedio</p>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-white mt-1">S/ 0.00</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Los datos se cargarán cuando conectes la API.</p>
              </div>
            </div>
            {/* Placeholder gráfico */}
            <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800/50 h-48 flex items-center justify-center">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Gráfico de ventas (solo diseño)</p>
            </div>
          </div>
        </section>

        {/* Productos más vendidos */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Package className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Productos más vendidos
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Producto</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Cantidad</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Ingresos (S/)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    No hay datos. Los reportes se cargarán cuando conectes la API.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Clientes recurrentes */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Users className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Clientes recurrentes
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Cliente</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Pedidos</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Último pedido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    No hay datos. Los reportes se cargarán cuando conectes la API.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Horarios pico */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Clock className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Horarios pico
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 py-8 text-center">
              No hay datos. Los reportes se cargarán cuando conectes la API.
            </p>
          </div>
        </section>

        {/* Exportación de datos */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Exportación de datos
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Exporta reportes por periodo en PDF o Excel (solo diseño).
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Periodo:</label>
                <select
                  className="rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-white"
                  defaultValue="mes"
                  aria-label="Periodo exportación"
                >
                  <option value="hoy">Hoy</option>
                  <option value="semana">Esta semana</option>
                  <option value="mes">Este mes</option>
                </select>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <FileDown className="h-4 w-4" aria-hidden /> Exportar PDF
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4" aria-hidden /> Exportar Excel
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
