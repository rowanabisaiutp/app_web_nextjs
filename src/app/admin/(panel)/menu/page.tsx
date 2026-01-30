import {
  UtensilsCrossed,
  FolderTree,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Tag,
  ToggleLeft,
} from "lucide-react";

export default function MenuPage() {
  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex items-center gap-3">
        <UtensilsCrossed className="h-8 w-8 text-neutral-500 dark:text-neutral-400" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Gestión del menú
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Alta, edición y baja de productos. Categorías, precios y disponibilidad (solo diseño)
          </p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Gestión de categorías */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FolderTree className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
              <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
                Categorías
              </h2>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
            >
              <Plus className="h-4 w-4" aria-hidden /> Nueva categoría
            </button>
          </div>
          <div className="p-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No hay categorías. Crea una para organizar los productos.
            </p>
          </div>
        </section>

        {/* Listado de productos */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Productos del menú
            </h2>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
            >
              <Plus className="h-4 w-4" aria-hidden /> Nuevo producto
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300 w-12">Imagen</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Producto</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Categoría</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Precio</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Disponibilidad</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    No hay productos. Añade categorías y productos desde el formulario.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Alta / Edición de producto (formulario diseño) */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <Tag className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Alta / Edición de producto
            </h2>
          </div>
          <div className="p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Nombre del producto
                </label>
                <input
                  type="text"
                  placeholder="Ej. Hamburguesa clásica"
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  readOnly
                  aria-label="Nombre del producto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Categoría
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white"
                  defaultValue=""
                  aria-label="Categoría"
                >
                  <option value="">Seleccionar categoría</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Precio (S/)
                </label>
                <input
                  type="text"
                  placeholder="0.00"
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                  readOnly
                  aria-label="Precio"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-neutral-300 dark:border-neutral-600" defaultChecked readOnly aria-label="Disponible" />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Disponible</span>
                </label>
              </div>
            </div>
            <div className="mt-5">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Imagen
              </label>
              <div className="flex items-center gap-4 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800/50 p-6">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-200 dark:bg-neutral-600 text-neutral-400">
                  <ImageIcon className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Arrastra una imagen o haz clic para subir
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    PNG, JPG hasta 2MB (solo diseño)
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
              >
                Guardar producto
              </button>
              <button
                type="button"
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
