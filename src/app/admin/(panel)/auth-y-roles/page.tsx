import { Shield, LogIn, ShieldCheck, UsersRound, BadgeCheck, Check } from "lucide-react";

export default function AuthYRolesPage() {
  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex items-center gap-3">
        <Shield className="h-8 w-8 text-neutral-500 dark:text-neutral-400" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Autenticación y roles
          </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Login de administrador, control de acceso, sesión y roles del sistema
        </p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Sección: Login de administrador */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <LogIn className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <div>
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Login de administrador
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Acceso seguro al panel con email y contraseña
            </p>
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap gap-3">
              <div className="h-10 w-48 rounded-lg bg-neutral-100 dark:bg-neutral-700 animate-pulse" />
              <div className="h-10 w-48 rounded-lg bg-neutral-100 dark:bg-neutral-700 animate-pulse" />
              <button
                type="button"
                disabled
                className="h-10 px-4 rounded-lg bg-neutral-200 dark:bg-neutral-600 text-neutral-500 text-sm font-medium cursor-not-allowed"
              >
                Iniciar sesión (diseño)
              </button>
            </div>
          </div>
        </section>

        {/* Sección: Control de acceso */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <div>
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Control de acceso
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Permisos por ruta y acción
            </p>
            </div>
          </div>
          <div className="p-5">
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-700/50">
                    <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                      Ruta / Módulo
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                      Admin
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                      Operador
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">
                      Cajero
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-600">
                  {["Dashboard", "Pedidos", "Menú", "Clientes", "Pagos"].map(
                    (row, i) => (
                      <tr key={row} className={i % 2 === 0 ? "bg-white dark:bg-neutral-800" : "bg-neutral-50/50 dark:bg-neutral-800/50"}>
                        <td className="px-4 py-3 text-neutral-900 dark:text-white">
                          {row}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                            <Check className="h-3 w-3" aria-hidden />
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-neutral-100 dark:bg-neutral-700 text-neutral-400 text-xs">
                            —
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-neutral-100 dark:bg-neutral-700 text-neutral-400 text-xs">
                            —
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">
              Vista previa de permisos por rol (solo diseño).
            </p>
          </div>
        </section>

        {/* Sección: Gestión de sesión */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <UsersRound className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <div>
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Gestión de sesión
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Sesión activa, expiración y cierre de sesión
            </p>
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-3 rounded-lg border border-neutral-200 dark:border-neutral-600 px-4 py-3">
                <span className="h-9 w-9 rounded-full bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center">
                  <UsersRound className="h-4 w-4 text-neutral-500" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    Sesión activa
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Expira en 7 días (diseño)
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled
                className="h-10 px-4 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 text-sm font-medium cursor-not-allowed"
              >
                Cerrar sesión en todos los dispositivos
              </button>
            </div>
          </div>
        </section>

        {/* Sección: Roles comunes */}
        <section className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden />
            <div>
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Roles del sistema
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Admin, Operador / Cocina, Cajero
            </p>
            </div>
          </div>
          <div className="p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  name: "Admin",
                  desc: "Acceso total al panel y configuración",
                  color: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
                },
                {
                  name: "Operador / Cocina",
                  desc: "Pedidos, menú y preparación",
                  color: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
                },
                {
                  name: "Cajero",
                  desc: "Pagos en efectivo o tarjeta",
                  color: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
                },
              ].map((role) => (
                <div
                  key={role.name}
                  className="rounded-lg border border-neutral-200 dark:border-neutral-600 p-4"
                >
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${role.color}`}
                  >
                    {role.name}
                  </span>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                    {role.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
