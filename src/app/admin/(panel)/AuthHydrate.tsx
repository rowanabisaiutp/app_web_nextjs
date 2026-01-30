"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks";

/**
 * Al montar el panel, carga la sesión en el contexto (GET /api/auth/me)
 * para que useAuth().user esté disponible en todo el panel.
 */
export function AuthHydrate() {
  const { fetchUser } = useAuth();
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  return null;
}
