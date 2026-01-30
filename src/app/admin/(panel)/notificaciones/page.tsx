import {
  Bell,
  Send,
  MessageSquare,
  Package,
  Tag,
  FileText,
  Users,
  ToggleLeft,
  Clock,
  CheckCircle,
} from "lucide-react";

const PLANTILLAS_MOCK = [
  { id: 1, nombre: "Pedido confirmado", contenido: "Tu pedido #{{numero}} ha sido confirmado.", activa: true },
  { id: 2, nombre: "Pedido en preparación", contenido: "Tu pedido está en cocina. Te avisamos cuando esté listo.", activa: true },
  { id: 3, nombre: "Pedido listo", contenido: "Tu pedido #{{numero}} está listo para recoger.", activa: true },
  { id: 4, nombre: "Pedido en camino", contenido: "Tu pedido está en camino. Llegará en unos minutos.", activa: true },
  { id: 5, nombre: "Promoción", contenido: "¡{{titulo}}! Válido hasta {{fecha}}. No te lo pierdas.", activa: false },
];

const NOTIFICACIONES_ENVIADAS_MOCK = [
  { id: 1, titulo: "Almuerzo 2x1 hoy", fecha: "29/01/2025 10:00", destinatarios: "Todos", estado: "enviado" },
  { id: 2, titulo: "Pedido #45 listo", fecha: "29/01/2025 14:35", destinatarios: "1 cliente", estado: "enviado" },
  { id: 3, titulo: "Cupón VERANO20", fecha: "28/01/2025 18:00", destinatarios: "Segmento: activos", estado: "enviado" },
];

export default function NotificacionesPage() {
  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex items-center gap-3">
        <Bell className="h-8 w-8 text-neutral-500 dark:text-neutral-400" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Notificaciones push
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Mensajes automáticos, avisos por cambio de estado, promociones y plantillas (solo diseño)
          </p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Enviar notificación push */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Send className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Enviar notificación push
            </h2>
          </div>
          <div className="p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Título
                </label>
                <input
                  type="text"
                  placeholder="Ej. Tu pedido está listo"
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  readOnly
                  aria-label="Título"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Destinatarios
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white"
                  defaultValue="todos"
                  aria-label="Destinatarios"
                >
                  <option value="todos">Todos los clientes</option>
                  <option value="activos">Clientes con pedidos recientes</option>
                  <option value="segmento">Segmento personalizado</option>
                </select>
              </div>
            </div>
            <div className="mt-5">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Mensaje
              </label>
              <textarea
                placeholder="Escribe el mensaje de la notificación push..."
                rows={3}
                className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 resize-none"
                readOnly
                aria-label="Mensaje"
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-3 items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-neutral-300 dark:border-neutral-600" readOnly aria-label="Programar" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Programar envío</span>
              </label>
              <input
                type="text"
                placeholder="Fecha y hora"
                className="w-40 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                readOnly
                aria-label="Fecha programada"
              />
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
              >
                <Send className="h-4 w-4" aria-hidden /> Enviar ahora
              </button>
            </div>
          </div>
        </section>

        {/* Mensajes automáticos a clientes */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Mensajes automáticos a clientes
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Activa o desactiva las notificaciones push que se envían automáticamente según el evento.
            </p>
            {[
              { label: "Pedido confirmado", desc: "Cuando el pedido es confirmado", icon: CheckCircle },
              { label: "Pedido en preparación", desc: "Cuando el pedido pasa a cocina", icon: Package },
              { label: "Pedido listo para recoger", desc: "Cuando el pedido está listo (recoger en local)", icon: Package },
              { label: "Pedido en camino", desc: "Cuando el repartidor sale con el pedido", icon: Package },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-neutral-200 dark:border-neutral-600 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.desc}</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Activo</span>
                    <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                      <ToggleLeft className="h-4 w-4 inline" aria-hidden /> Sí
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </section>

        {/* Avisos por cambio de estado */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Package className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Avisos por cambio de estado
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              El cliente recibe una notificación push cada vez que cambia el estado de su pedido (confirmado, en preparación, listo, en camino, entregado).
            </p>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 p-4 bg-neutral-50 dark:bg-neutral-700/30">
              <p className="text-sm font-medium text-neutral-900 dark:text-white">Notificaciones de estado activadas</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Los avisos se envían según la plantilla configurada para cada estado (solo diseño).</p>
            </div>
          </div>
        </section>

        {/* Promociones */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Tag className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Notificaciones de promociones
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Cuando crees o actives una promoción o cupón, puedes enviar una notificación push a los clientes (opcional).
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-neutral-300 dark:border-neutral-600" defaultChecked readOnly aria-label="Notificar promociones" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Enviar notificación al activar promoción o cupón</span>
            </label>
          </div>
        </section>

        {/* Plantillas de mensajes */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <FileText className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Plantillas de mensajes
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Plantilla</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Contenido</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                {PLANTILLAS_MOCK.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{p.nombre}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 max-w-xs truncate">{p.contenido}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          p.activa
                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                            : "bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                        }`}
                      >
                        {p.activa ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Historial de notificaciones enviadas */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Clock className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Notificaciones enviadas
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Título</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Destinatarios</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                {NOTIFICACIONES_ENVIADAS_MOCK.map((n) => (
                  <tr key={n.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{n.titulo}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{n.fecha}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{n.destinatarios}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle className="h-3.5 w-3.5" aria-hidden /> Enviado
                      </span>
                    </td>
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
