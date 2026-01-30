import {
  CreditCard,
  Banknote,
  Wallet,
  Plus,
  Search,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";

export default function PagosPage() {
  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex items-center gap-3">
        <CreditCard className="h-8 w-8 text-neutral-500 dark:text-neutral-400" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Pagos
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Registro de pagos en efectivo o tarjeta (solo diseño)
          </p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Métodos de pago */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Wallet className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Métodos de pago
            </h2>
          </div>
          <div className="p-5 flex flex-wrap gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-neutral-200 dark:border-neutral-600 px-5 py-4 bg-neutral-50 dark:bg-neutral-700/30 min-w-[180px]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                <Banknote className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">Efectivo</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Pago en efectivo</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-neutral-200 dark:border-neutral-600 px-5 py-4 bg-neutral-50 dark:bg-neutral-700/30 min-w-[180px]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <CreditCard className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">Tarjeta</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Débito o crédito</p>
              </div>
            </div>
          </div>
        </section>

        {/* Registro de pagos */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Plus className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Registrar pago
            </h2>
          </div>
          <div className="p-5">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  N.º de pedido
                </label>
                <input
                  type="text"
                  placeholder="Ej. 42"
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  readOnly
                  aria-label="Número de pedido"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Monto (S/)
                </label>
                <input
                  type="text"
                  placeholder="0.00"
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  readOnly
                  aria-label="Monto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Método de pago
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white"
                  defaultValue=""
                  aria-label="Método de pago"
                >
                  <option value="">Seleccionar</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
                >
                  Registrar pago
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Lista de pagos y estado */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Registro de pagos
            </h2>
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" aria-hidden />
              <input
                type="text"
                placeholder="Buscar por pedido..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm placeholder:text-neutral-400"
                readOnly
                aria-label="Buscar pagos"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">#</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Pedido</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Monto</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Método</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    No hay pagos registrados. Los datos se cargarán cuando conectes la API.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Resumen (diseño) */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Resumen del día
            </h2>
          </div>
          <div className="p-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 p-4">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Efectivo</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-white mt-1">S/ 0.00</p>
            </div>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 p-4">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Tarjeta</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-white mt-1">S/ 0.00</p>
            </div>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 p-4">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Total</p>
              <p className="text-xl font-semibold text-neutral-900 dark:text-white mt-1">S/ 0.00</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
