import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;
  const payload = token ? await verifyToken(token) : null;

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Vista rápida del negocio en tiempo real
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { title: "Ventas del día", value: "—", subtitle: "Hoy" },
          { title: "Pedidos activos", value: "—", subtitle: "En curso" },
          { title: "Ingresos totales", value: "—", subtitle: "Periodo" },
          { title: "Ticket promedio", value: "—", subtitle: "Promedio" },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5"
          >
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {card.title}
            </p>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-white mt-1">
              {card.value}
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              {card.subtitle}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6">
        <p className="text-neutral-600 dark:text-neutral-400">
          Bienvenido{payload?.email ? `, ${payload.email}` : ""}. Aquí puedes gestionar el sitio.
        </p>
      </div>
    </div>
  );
}
