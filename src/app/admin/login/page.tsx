"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks";

/* Iconos SVG inline para no añadir dependencias */
const IconRestaurant = () => (
  <svg className="w-12 h-12 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v9.642a.75.75 0 001.5 0v-5.5h9v5.5a.75.75 0 001.5 0v-9.642c0-1.135-.845-2.098-1.976-2.234C14.697 9.806 13.355 9.75 12 9.75m0 0v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v.75m12 0v-.75c0-1.135-.845-2.098-1.976-2.234C14.697 9.806 13.355 9.75 12 9.75m0 0v-1.5m0 1.5c1.355 0 2.697.056 4.024.166 1.131.136 1.976 1.099 1.976 2.234v.75M3 12a9 9 0 1018 0m-9 0a9 9 0 019-9" />
  </svg>
);

const IconClipboard = () => (
  <svg className="w-5 h-5 shrink-0 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const IconMenu = () => (
  <svg className="w-5 h-5 shrink-0 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const IconBox = () => (
  <svg className="w-5 h-5 shrink-0 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

const IconChart = () => (
  <svg className="w-5 h-5 shrink-0 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const IconMail = () => (
  <svg className="w-5 h-5 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const IconLock = () => (
  <svg className="w-5 h-5 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const IconArrowRight = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const IconShield = () => (
  <svg className="w-10 h-10 text-neutral-700 dark:text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, loading, error, setError } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await login(email, password);
    if (result.ok) {
      router.push(redirect);
      router.refresh();
    }
  }

  const features = [
    { icon: IconClipboard, text: "Pedidos en un solo lugar" },
    { icon: IconMenu, text: "Menú y platos" },
    { icon: IconBox, text: "Inventario y stock" },
    { icon: IconChart, text: "Ventas y reportes" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Panel izquierdo: presentación con iconos */}
      <div className="hidden md:flex md:w-1/2 bg-white min-h-screen items-center justify-center px-12 lg:px-16">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <IconRestaurant />
            <span className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Panel de control</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-semibold text-neutral-900 mb-4">
            Administración de tu negocio de venta de comida
          </h2>
          <p className="text-neutral-600 leading-relaxed mb-8">
            Gestiona todo desde un solo lugar. Controla tu restaurante o negocio de comida de forma sencilla y segura.
          </p>
          <ul className="space-y-4" role="list">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-neutral-700">
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-100 text-neutral-600">
                  <Icon />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Panel derecho: formulario de login (sin card) */}
      <div className="flex-1 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-6 py-12 md:py-0 min-h-screen">
        <div className="w-full max-w-[340px]">
          <div className="flex items-center gap-3 mb-8">
            <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900" aria-hidden>
              <IconShield />
            </span>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Acceso seguro
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Inicia sesión para continuar
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2.5"
                role="alert"
              >
                <IconLock />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  <IconMail />
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 focus:border-transparent placeholder:text-neutral-400 transition-shadow"
                  placeholder="tu@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  <IconLock />
                </span>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 focus:border-transparent placeholder:text-neutral-400 transition-shadow"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium py-3 hover:bg-neutral-800 dark:hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden />
              ) : (
                <>
                  Entrar
                  <IconArrowRight />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-8">
            ¿No tienes cuenta?{" "}
            <Link href="/admin/register" className="font-medium text-neutral-900 dark:text-white hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
