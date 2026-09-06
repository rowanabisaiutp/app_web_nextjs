/**
 * Tipos compartidos entre frontend y backend.
 * Usar aquí interfaces que expongan las APIs o que usen tanto server como client.
 */

export type Role = "ADMIN" | "CAJERO";

export type User = {
  id: number;
  email: string;
  name: string | null;
  role: Role;
  workBusinessId: number | null;
};

export type AuthLoginResponse =
  | { ok: true; user: Pick<User, "id" | "email" | "name" | "role" | "workBusinessId"> }
  | { error: string };

export type AuthMeResponse =
  | { user: User }
  | { user: null };

export type AuthRegisterResponse =
  | { ok: true; user: Pick<User, "id" | "email" | "name">; message: string }
  | { error: string };
