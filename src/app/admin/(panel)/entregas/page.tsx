import {
  Truck,
  MapPin,
  Store,
  Home,
  Search,
  CheckCircle,
  Clock,
  Package,
  ChevronRight,
} from "lucide-react";

const ENTREGAS_MOCK = [
  { id: 1, pedidoId: 45, cliente: "María García", tipo: "domicilio", direccion: "Av. Principal 123, Lima", estado: "en_camino" },
  { id: 2, pedidoId: 44, cliente: "Juan Pérez", tipo: "local", direccion: "—", estado: "pendiente" },
  { id: 3, pedidoId: 43, cliente: "Ana López", tipo: "domicilio", direccion: "Jr. Los Olivos 456", estado: "entregado" },
  { id: 4, pedidoId: 42, cliente: "Carlos Ruiz", tipo: "local", direccion: "—", estado: "entregado" },
];

const badgeEstado: Record<string, { label: string; class: string; Icon: typeof Clock }> = {
  pendiente: { label: "Pendiente", class: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300", Icon: Clock },
  en_camino: { label: "En camino", class: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300", Icon: Truck },
  entregado: { label: "Entregado", class: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300", Icon: CheckCircle },
};

export default function EntregasPage() {
  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex items-center gap-3">
        <Truck className="h-8 w-8 text-neutral-500 dark:text-neutral-400" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Entregas
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Pedidos para recoger en local, a domicilio y confirmación (solo diseño)
          </p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Tipo de entrega */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Tipo de entrega
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Pedidos para recoger en local o pedidos a domicilio
            </p>
          </div>
          <div className="p-5 flex flex-wrap gap-4">
            <div className="flex items-center gap-4 rounded-lg border-2 border-neutral-300 dark:border-neutral-500 bg-neutral-50 dark:bg-neutral-700/30 px-5 py-4 min-w-[220px]">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                <Store className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">Recoger en local</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">El cliente retira en el negocio</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-neutral-200 dark:border-neutral-600 px-5 py-4 min-w-[220px] hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <Home className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">A domicilio</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Envío a dirección del cliente</p>
              </div>
            </div>
          </div>
        </section>

        {/* Lista de entregas */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Entregas
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" aria-hidden />
              <input
                type="text"
                placeholder="Buscar por pedido o cliente..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm placeholder:text-neutral-400"
                readOnly
                aria-label="Buscar entregas"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Pedido</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Dirección</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                {ENTREGAS_MOCK.map((e) => {
                  const estado = badgeEstado[e.estado];
                  const EstadoIcon = estado.Icon;
                  return (
                    <tr key={e.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                      <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">#{e.pedidoId}</td>
                      <td className="px-4 py-3 text-neutral-900 dark:text-white">{e.cliente}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            e.tipo === "local"
                              ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                              : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                          }`}
                        >
                          {e.tipo === "local" ? (
                            <Store className="h-3.5 w-3.5" aria-hidden />
                          ) : (
                            <Home className="h-3.5 w-3.5" aria-hidden />
                          )}
                          {e.tipo === "local" ? "Recoger en local" : "A domicilio"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 max-w-[200px] truncate" title={e.direccion}>
                        {e.direccion}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${estado.class}`}>
                          <EstadoIcon className="h-3.5 w-3.5" aria-hidden />
                          {estado.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {e.estado !== "entregado" && (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white transition-colors"
                          >
                            Confirmar entrega
                            <ChevronRight className="h-4 w-4" aria-hidden />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Dirección de entrega (detalle ejemplo) */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Dirección de entrega
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
              Pedido #45 — María García (a domicilio)
            </p>
            <div className="flex items-start gap-3 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700/30 p-4">
              <MapPin className="h-5 w-5 text-neutral-400 shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">Av. Principal 123, Lima</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Referencia: Frente al parque (solo diseño)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Confirmación de entrega */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Package className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Confirmación de entrega
            </h2>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-colors"
              >
                <CheckCircle className="h-4 w-4" aria-hidden />
                Marcar como entregado
              </button>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Marca el pedido como entregado cuando el cliente reciba su pedido (solo diseño).
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
