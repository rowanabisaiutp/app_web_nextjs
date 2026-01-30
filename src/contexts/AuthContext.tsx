"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User, AuthLoginResponse, AuthRegisterResponse } from "@/types";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<{ ok: boolean }>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<{ ok: boolean }>;
  fetchUser: () => Promise<User | null>;
  setError: (error: string | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
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
        const user =
          "user" in data && data.user
            ? { ...data.user, role: "ADMIN" as const }
            : null;
        setState((s) => ({ ...s, loading: false, user }));
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
          body: JSON.stringify({
            email,
            password,
            name: name || undefined,
          }),
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
        setState((s) => ({
          ...s,
          loading: false,
          error: "Error de conexión",
        }));
        return { ok: false as const };
      }
    },
    []
  );

  const setError = useCallback((error: string | null) => {
    setState((s) => ({ ...s, error }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    register,
    fetchUser,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
