"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User, AuthLoginResponse, AuthRegisterResponse } from "@/types";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: false,
    error: null,
  });

  const login = useCallback(
    async (email: string, password: string) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data: AuthLoginResponse = await res.json();
        if (!res.ok) {
          setState((s) => ({
            ...s,
            loading: false,
            error: "error" in data ? data.error : "Error al iniciar sesión",
          }));
          return { ok: false as const };
        }
        setState((s) => ({ ...s, loading: false, user: data.user ?? null }));
        return { ok: true as const };
      } catch {
        setState((s) => ({ ...s, loading: false, error: "Error de conexión" }));
        return { ok: false as const };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setState({ user: null, loading: false, error: null });
    router.push("/admin/login");
    router.refresh();
  }, [router]);

  const fetchUser = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      const user = res.ok && data.user ? data.user : null;
      setState((s) => ({ ...s, user, loading: false }));
      return user;
    } catch {
      setState((s) => ({ ...s, user: null, loading: false }));
      return null;
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name: name || undefined }),
        });
        const data: AuthRegisterResponse = await res.json();
        if (!res.ok) {
          setState((s) => ({
            ...s,
            loading: false,
            error: "error" in data ? data.error : "Error al registrarse",
          }));
          return { ok: false as const };
        }
        setState((s) => ({ ...s, loading: false }));
        return { ok: true as const };
      } catch {
        setState((s) => ({ ...s, loading: false, error: "Error de conexión" }));
        return { ok: false as const };
      }
    },
    []
  );

  const setError = useCallback((error: string | null) => {
    setState((s) => ({ ...s, error }));
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    fetchUser,
    setError,
  };
}
