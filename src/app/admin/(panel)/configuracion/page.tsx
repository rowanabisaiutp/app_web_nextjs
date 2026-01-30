import {
  Settings,
  Building2,
  Clock,
  Truck,
  Percent,
  CreditCard,
  Banknote,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export default function ConfiguracionPage() {
  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex items-center gap-3">
        <Settings className="h-8 w-8 text-neutral-500 dark:text-neutral-400" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Configuración del negocio
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Información del negocio, horarios, costos de envío e impuestos (solo diseño)
          </p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Información del negocio */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Información del negocio
            </h2>
          </div>
          <div className="p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Nombre del negocio
                </label>
                <input
                  type="text"
                  placeholder="Ej. Mi Comida"
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  readOnly
                  aria-label="Nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  RUC (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. 20123456789"
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  readOnly
                  aria-label="RUC"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-neutral-200 dark:bg-neutral-600 text-neutral-400">
                  <Building2 className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Logo del negocio</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Sube una imagen (solo diseño)</p>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Dirección
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" aria-hidden />
                  <input
                    type="text"
                    placeholder="Av. Principal 123, Lima"
                    className="w-full pl-9 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                    readOnly
                    aria-label="Dirección"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" aria-hidden />
                  <input
                    type="text"
                    placeholder="999 123 456"
                    className="w-full pl-9 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                    readOnly
                    aria-label="Teléfono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Email de contacto
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" aria-hidden />
                  <input
                    type="text"
                    placeholder="contacto@negocio.com"
                    className="w-full pl-9 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                    readOnly
                    aria-label="Email"
                  />
                </div>
              </div>
            </div>
            <div className="mt-5">
              <button
                type="button"
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
              >
                Guardar información
              </button>
            </div>
          </div>
        </section>

        {/* Horarios de atención */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Clock className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Horarios de atención
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 py-8 text-center">
              No hay horarios configurados. Los datos se cargarán cuando conectes la API.
            </p>
            <div className="mt-5">
              <button
                type="button"
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
              >
                Guardar horarios
              </button>
            </div>
          </div>
        </section>

        {/* Costos de envío */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Truck className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Costos de envío
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Configura el costo de envío para pedidos a domicilio (solo diseño).
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Costo fijo (S/)
                </label>
                <input
                  type="text"
                  placeholder="Ej. 5.00"
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  readOnly
                  aria-label="Costo envío"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-neutral-300 dark:border-neutral-600" readOnly aria-label="Envío gratis" />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Envío gratis desde monto mínimo</span>
                </label>
              </div>
            </div>
            <div className="mt-5">
              <button
                type="button"
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
              >
                Guardar costos de envío
              </button>
            </div>
          </div>
        </section>

        {/* Impuestos */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Percent className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Impuestos
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              IGV u otro impuesto aplicable a los precios (solo diseño).
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  IGV (%)
                </label>
                <input
                  type="text"
                  placeholder="Ej. 18"
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  readOnly
                  aria-label="IGV"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-neutral-300 dark:border-neutral-600" defaultChecked readOnly aria-label="Precios con IGV incluido" />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Precios con IGV incluido</span>
                </label>
              </div>
            </div>
            <div className="mt-5">
              <button
                type="button"
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
              >
                Guardar impuestos
              </button>
            </div>
          </div>
        </section>

        {/* Métodos de pago */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Métodos de pago
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Métodos aceptados: efectivo y tarjeta (solo diseño).
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 py-6 text-center">
              No hay métodos de pago configurados. Los datos se cargarán cuando conectes la API.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
