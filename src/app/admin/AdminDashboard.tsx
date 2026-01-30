"use client";

import { useAuth } from "@/hooks";
import type { User } from "@/types";

type Props = {
  user: Pick<User, "email" | "id">;
};

export function AdminDashboard({ user }: Props) {
  const { logout } = useAuth();

  return (
    <>
      <header className="border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Panel Admin
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {user.email}
            </span>
            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white focus:outline-none focus:underline"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6">
          <p className="text-neutral-600 dark:text-neutral-400">
            Bienvenido al panel de administración. Aquí puedes gestionar el sitio.
          </p>
        </div>
      </main>
    </>
  );
}
