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

const CLIENTES_MOCK = [
  { id: 1, nombre: "María García", email: "maria@ejemplo.com", telefono: "999 111 222", pedidos: 12, bloqueado: false },
  { id: 2, nombre: "Juan Pérez", email: "juan@ejemplo.com", telefono: "999 333 444", pedidos: 5, bloqueado: false },
  { id: 3, nombre: "Ana López", email: "ana@ejemplo.com", telefono: "999 555 666", pedidos: 28, bloqueado: true },
  { id: 4, nombre: "Carlos Ruiz", email: "carlos@ejemplo.com", telefono: "999 777 888", pedidos: 3, bloqueado: false },
];

const HISTORIAL_MOCK = [
  { id: 101, fecha: "29/01/2025", total: "24.50", estado: "Entregado" },
  { id: 102, fecha: "28/01/2025", total: "18.00", estado: "Entregado" },
  { id: 103, fecha: "25/01/2025", total: "31.20", estado: "Entregado" },
];

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
                {CLIENTES_MOCK.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{c.nombre}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{c.email}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{c.telefono}</td>
                    <td className="px-4 py-3 text-neutral-900 dark:text-white">{c.pedidos}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          c.bloqueado
                            ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                            : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {c.bloqueado ? "Bloqueado" : "Activo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white transition-colors"
                      >
                        <Eye className="h-4 w-4" aria-hidden /> Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
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
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">María García</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Cliente desde 15/08/2024</p>
              </div>
              <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                Activo
              </span>
            </div>

            {/* Datos de contacto */}
            <div>
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Datos de contacto</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-3 text-sm text-neutral-900 dark:text-white">
                  <Mail className="h-4 w-4 text-neutral-400 shrink-0" aria-hidden />
                  maria@ejemplo.com
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-900 dark:text-white">
                  <Phone className="h-4 w-4 text-neutral-400 shrink-0" aria-hidden />
                  999 111 222
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                  <MapPin className="h-4 w-4 text-neutral-400 shrink-0" aria-hidden />
                  Av. Principal 123, Lima (solo diseño)
                </li>
              </ul>
            </div>

            {/* Historial de pedidos */}
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
                    {HISTORIAL_MOCK.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-2 font-medium text-neutral-900 dark:text-white">#{p.id}</td>
                        <td className="px-4 py-2 text-neutral-600 dark:text-neutral-400">{p.fecha}</td>
                        <td className="px-4 py-2 text-neutral-900 dark:text-white text-right font-medium">S/ {p.total}</td>
                        <td className="px-4 py-2">
                          <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                            {p.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
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
