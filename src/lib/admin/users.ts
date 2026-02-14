import { formatDateShort } from "@/lib/utils/format";

export type AdminUserRow = {
  id: number;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
};

/** Normaliza un usuario de la API (lista): convierte createdAt a string formateado */
export function formatUserFromApi<T extends { createdAt?: string | Date }>(
  u: T
): T & { createdAt: string } {
  const createdAt =
    typeof u.createdAt === "string"
      ? u.createdAt
      : u.createdAt
        ? formatDateShort(u.createdAt)
        : "";
  return { ...u, createdAt } as T & { createdAt: string };
}
