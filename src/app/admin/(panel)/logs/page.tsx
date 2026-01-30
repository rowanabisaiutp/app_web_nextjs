import {
  ScrollText,
  History,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  User,
  Calendar,
} from "lucide-react";

const ACCIONES_MOCK = [
  { id: 1, fecha: "29/01/2025 14:35", usuario: "admin@negocio.com", accion: "Cambio de estado", recurso: "Pedido #45", detalle: "En preparación → Listo" },
  { id: 2, fecha: "29/01/2025 14:32", usuario: "admin@negocio.com", accion: "Login", recurso: "—", detalle: "Sesión iniciada" },
  { id: 3, fecha: "29/01/2025 14:12", usuario: "admin@negocio.com", accion: "Registro de pago", recurso: "Pedido #44", detalle: "S/ 18.00 — Tarjeta" },
  { id: 4, fecha: "29/01/2025 13:58", usuario: "admin@negocio.com", accion: "Confirmación de entrega", recurso: "Pedido #43", detalle: "Marcado como entregado" },
  { id: 5, fecha: "28/01/2025 20:15", usuario: "admin@negocio.com", accion: "Cancelación de pedido", recurso: "Pedido #38", detalle: "Pedido cancelado" },
];

const CAMBIOS_ESTADO_MOCK = [
  { id: 1, fecha: "29/01/2025 14:35", recurso: "Pedido #45", anterior: "En preparación", nuevo: "Listo", usuario: "admin@negocio.com" },
  { id: 2, fecha: "29/01/2025 14:15", recurso: "Pedido #44", anterior: "Confirmado", nuevo: "En preparación", usuario: "admin@negocio.com" },
  { id: 3, fecha: "29/01/2025 13:58", recurso: "Pedido #43", anterior: "En camino", nuevo: "Entregado", usuario: "admin@negocio.com" },
];

const ERRORES_MOCK = [
  { id: 1, fecha: "28/01/2025 22:10", tipo: "API", mensaje: "Timeout al conectar con servicio de pagos", recurso: "Pedido #40" },
  { id: 2, fecha: "27/01/2025 09:05", tipo: "Validación", mensaje: "Datos de cliente incompletos", recurso: "Registro" },
];

export default function LogsPage() {
  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex items-center gap-3">
        <ScrollText className="h-8 w-8 text-neutral-500 dark:text-neutral-400" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Logs y auditoría
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Historial de acciones, cambios de estado y errores del sistema (solo diseño)
          </p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Filtros */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Filter className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Filtros
            </h2>
          </div>
          <div className="p-5 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" aria-hidden />
              <input
                type="text"
                placeholder="Buscar por acción, recurso o usuario..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm placeholder:text-neutral-400"
                readOnly
                aria-label="Buscar"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neutral-400" aria-hidden />
              <input
                type="text"
                placeholder="Desde"
                className="w-32 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                readOnly
                aria-label="Fecha desde"
              />
              <span className="text-neutral-400">—</span>
              <input
                type="text"
                placeholder="Hasta"
                className="w-32 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                readOnly
                aria-label="Fecha hasta"
              />
            </div>
            <select
              className="rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2 text-sm text-neutral-900 dark:text-white"
              defaultValue="todos"
              aria-label="Tipo"
            >
              <option value="todos">Todas las acciones</option>
              <option value="login">Login</option>
              <option value="estado">Cambio de estado</option>
              <option value="pago">Registro de pago</option>
              <option value="entrega">Confirmación de entrega</option>
              <option value="cancelacion">Cancelación</option>
            </select>
          </div>
        </section>

        {/* Historial de acciones */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <History className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Historial de acciones
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Fecha / Hora</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Usuario</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Acción</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Recurso</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                {ACCIONES_MOCK.map((a) => (
                  <tr key={a.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{a.fecha}</td>
                    <td className="px-4 py-3 text-neutral-900 dark:text-white">
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-neutral-400" aria-hidden />
                        {a.usuario}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{a.accion}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{a.recurso}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 max-w-[240px] truncate" title={a.detalle}>
                      {a.detalle}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Cambios de estado */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Cambios de estado
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Fecha / Hora</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Recurso</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Estado anterior</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Estado nuevo</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                {CAMBIOS_ESTADO_MOCK.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{c.fecha}</td>
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{c.recurso}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{c.anterior}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                        {c.nuevo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{c.usuario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Errores del sistema */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Errores del sistema
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Fecha / Hora</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Mensaje</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Recurso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                {ERRORES_MOCK.map((e) => (
                  <tr key={e.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{e.fecha}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                        {e.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-900 dark:text-white max-w-[320px] truncate" title={e.mensaje}>
                      {e.mensaje}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{e.recurso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
