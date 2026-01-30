import {
  ClipboardList,
  Search,
  Filter,
  Eye,
  XCircle,
  ChevronDown,
  Clock,
  Package,
} from "lucide-react";

const ESTADOS = [
  { id: "todos", label: "Todos" },
  { id: "confirmado", label: "Confirmado" },
  { id: "en_preparacion", label: "En preparación" },
  { id: "listo", label: "Listo" },
  { id: "entregado", label: "Entregado" },
  { id: "cancelado", label: "Cancelado" },
] as const;

const badgeClass: Record<string, string> = {
  confirmado: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  en_preparacion: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  listo: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  entregado: "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300",
  cancelado: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
};

const PEDIDOS_MOCK = [
  { id: 1, cliente: "María García", fecha: "29/01/2025 14:32", estado: "en_preparacion", total: "24.50" },
  { id: 2, cliente: "Juan Pérez", fecha: "29/01/2025 14:15", estado: "confirmado", total: "18.00" },
  { id: 3, cliente: "Ana López", fecha: "29/01/2025 13:58", estado: "listo", total: "31.20" },
  { id: 4, cliente: "Carlos Ruiz", fecha: "29/01/2025 12:40", estado: "entregado", total: "15.80" },
  { id: 5, cliente: "Laura Martínez", fecha: "28/01/2025 20:10", estado: "cancelado", total: "22.00" },
];

const ITEMS_MOCK = [
  { producto: "Hamburguesa clásica", cantidad: 2, precio: "8.50" },
  { producto: "Papas fritas", cantidad: 1, precio: "3.50" },
  { producto: "Refresco", cantidad: 2, precio: "2.00" },
];

export default function PedidosPage() {
  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex items-center gap-3">
        <ClipboardList className="h-8 w-8 text-neutral-500 dark:text-neutral-400" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Gestión de pedidos
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Lista en tiempo real, detalle, cambio de estado y cancelación (solo diseño)
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
                placeholder="Buscar por cliente o número..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm placeholder:text-neutral-400"
                readOnly
                aria-label="Buscar pedidos"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Estado:</span>
              <select
                className="rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm px-4 py-2 pr-8 appearance-none cursor-default"
                defaultValue="todos"
                aria-label="Filtrar por estado"
              >
                {ESTADOS.map((e) => (
                  <option key={e.id} value={e.id}>{e.label}</option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-neutral-400 -ml-6 pointer-events-none" aria-hidden />
            </div>
          </div>
        </section>

        {/* Lista de pedidos en tiempo real */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Clock className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Lista de pedidos
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">#</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                {PEDIDOS_MOCK.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                    <td className="px-4 py-3 text-neutral-900 dark:text-white font-medium">{p.id}</td>
                    <td className="px-4 py-3 text-neutral-900 dark:text-white">{p.cliente}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{p.fecha}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${badgeClass[p.estado] ?? ""}`}>
                        {p.estado.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-900 dark:text-white text-right font-medium">S/ {p.total}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white transition-colors"
                      >
                        <Eye className="h-4 w-4" aria-hidden /> Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Detalle de pedido (ejemplo) */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Package className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Detalle de pedido
            </h2>
          </div>
          <div className="p-5 space-y-5">
            <div className="flex flex-wrap gap-4 items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">Pedido #1 — María García</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">29/01/2025 14:32</p>
              </div>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass.en_preparacion}`}>
                En preparación
              </span>
            </div>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                    <th className="text-left px-4 py-2 font-medium text-neutral-700 dark:text-neutral-300">Producto</th>
                    <th className="text-center px-4 py-2 font-medium text-neutral-700 dark:text-neutral-300">Cant.</th>
                    <th className="text-right px-4 py-2 font-medium text-neutral-700 dark:text-neutral-300">P. unit.</th>
                    <th className="text-right px-4 py-2 font-medium text-neutral-700 dark:text-neutral-300">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                  {ITEMS_MOCK.map((item, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 text-neutral-900 dark:text-white">{item.producto}</td>
                      <td className="px-4 py-2 text-neutral-600 dark:text-neutral-400 text-center">{item.cantidad}</td>
                      <td className="px-4 py-2 text-neutral-600 dark:text-neutral-400 text-right">S/ {item.precio}</td>
                      <td className="px-4 py-2 text-neutral-900 dark:text-white text-right font-medium">
                        S/ {(Number(item.precio) * item.cantidad).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-neutral-200 dark:border-neutral-600">
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                Total: <span className="text-lg">S/ 24.50</span>
              </p>
              <div className="flex flex-wrap gap-2">
                <select
                  className="rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm px-3 py-2 pr-8"
                  defaultValue="en_preparacion"
                  aria-label="Cambiar estado"
                >
                  <option value="confirmado">Confirmado</option>
                  <option value="en_preparacion">En preparación</option>
                  <option value="listo">Listo</option>
                  <option value="entregado">Entregado</option>
                </select>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <XCircle className="h-4 w-4" aria-hidden /> Cancelar pedido
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Historial de pedidos */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Historial de pedidos
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Pedidos finalizados o cancelados (solo diseño)
            </p>
          </div>
          <div className="p-5">
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                    <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">#</th>
                    <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Cliente</th>
                    <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Fecha</th>
                    <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Estado</th>
                    <th className="text-right px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                  {PEDIDOS_MOCK.filter((p) => p.estado === "entregado" || p.estado === "cancelado").map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 text-neutral-900 dark:text-white font-medium">{p.id}</td>
                      <td className="px-4 py-3 text-neutral-900 dark:text-white">{p.cliente}</td>
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{p.fecha}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass[p.estado] ?? ""}`}>
                          {p.estado.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-900 dark:text-white text-right font-medium">S/ {p.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
