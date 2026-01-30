import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Eye,
  Ban,
  ClipboardList,
  UserCircle,
} from "lucide-react";

export default function ClientesPage() {
  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex items-center gap-3">
        <Users className="h-8 w-8 text-neutral-500 dark:text-neutral-400" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Gestión de clientes
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Listado, detalle, historial de pedidos y datos de contacto (solo diseño)
          </p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Listado de clientes */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Listado de clientes
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" aria-hidden />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm placeholder:text-neutral-400"
                readOnly
                aria-label="Buscar clientes"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Teléfono</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Pedidos</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    No hay clientes. Los datos se cargarán cuando conectes la API.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Detalle del cliente */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <UserCircle className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Detalle del cliente
            </h2>
          </div>
          <div className="p-5 space-y-6">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Selecciona un cliente de la lista para ver el detalle y el historial de pedidos.
            </p>
            <div>
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                <ClipboardList className="h-4 w-4" aria-hidden /> Historial de pedidos
              </h4>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                      <th className="text-left px-4 py-2 font-medium text-neutral-700 dark:text-neutral-300">Pedido</th>
                      <th className="text-left px-4 py-2 font-medium text-neutral-700 dark:text-neutral-300">Fecha</th>
                      <th className="text-right px-4 py-2 font-medium text-neutral-700 dark:text-neutral-300">Total</th>
                      <th className="text-left px-4 py-2 font-medium text-neutral-700 dark:text-neutral-300">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                        Sin historial
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bloqueo (opcional) */}
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-600">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Ban className="h-4 w-4" aria-hidden /> Bloquear cliente
              </button>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                Opcional: impide que el cliente realice nuevos pedidos (solo diseño).
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
