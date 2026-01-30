import {
  Tag,
  Ticket,
  Package,
  Clock,
  Plus,
  Pencil,
  ToggleLeft,
  Percent,
  Calendar,
} from "lucide-react";

const CUPONES_MOCK = [
  { id: 1, codigo: "VERANO20", tipo: "porcentaje", valor: "20%", vigencia: "01/01 - 31/01", usos: "15/50", activo: true },
  { id: 2, codigo: "S/5OFF", tipo: "monto", valor: "S/ 5", vigencia: "01/01 - 15/02", usos: "8/100", activo: true },
  { id: 3, codigo: "PRIMERA", tipo: "porcentaje", valor: "15%", vigencia: "Permanente", usos: "23/∞", activo: false },
];

const COMBOS_MOCK = [
  { id: 1, nombre: "Combo hamburguesa", productos: "Hamburguesa + Papas + Bebida", precio: "12.00", activo: true },
  { id: 2, nombre: "Combo familiar", productos: "2 Hamburguesas + 2 Papas + 2 Bebidas", precio: "22.00", activo: false },
];

const PROMOS_TIEMPO_MOCK = [
  { id: 1, nombre: "Almuerzo 2x1", descripcion: "De 12:00 a 15:00", horario: "12:00 - 15:00", activa: true },
  { id: 2, nombre: "Happy hour bebidas", descripcion: "30% en bebidas", horario: "18:00 - 20:00", activa: false },
];

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
                {CUPONES_MOCK.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30">
                    <td className="px-4 py-3 font-mono font-medium text-neutral-900 dark:text-white">{c.codigo}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                      {c.tipo === "porcentaje" ? (
                        <span className="inline-flex items-center gap-1"><Percent className="h-3.5 w-3.5" aria-hidden /> %</span>
                      ) : (
                        "Monto fijo"
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-900 dark:text-white font-medium">{c.valor}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{c.vigencia}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{c.usos}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          c.activo
                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                            : "bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                        }`}
                      >
                        <ToggleLeft className="h-3.5 w-3.5" aria-hidden />
                        {c.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white transition-colors"
                        >
                          <Pencil className="h-4 w-4" aria-hidden /> Editar
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                        >
                          {c.activo ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
            <div className="grid gap-4 sm:grid-cols-2">
              {COMBOS_MOCK.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-neutral-200 dark:border-neutral-600 p-4 flex flex-wrap items-start justify-between gap-3"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{c.nombre}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{c.productos}</p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white mt-2">S/ {c.precio}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        c.activo
                          ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                          : "bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                      }`}
                    >
                      {c.activo ? "Activo" : "Inactivo"}
                    </span>
                    <button
                      type="button"
                      className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="space-y-3">
              {PROMOS_TIEMPO_MOCK.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-neutral-200 dark:border-neutral-600 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                      <Calendar className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{p.nombre}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{p.descripcion}</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">Horario: {p.horario}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.activa
                          ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                          : "bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                      }`}
                    >
                      {p.activa ? "Activa" : "Inactiva"}
                    </span>
                    <button
                      type="button"
                      className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      {p.activa ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
