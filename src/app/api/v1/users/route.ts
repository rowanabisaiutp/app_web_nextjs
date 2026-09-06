import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/requireAdmin";
import { listUsers, createUser, findUserByEmail } from "@/lib/services/auth.service";
import { listBusinessesByUser } from "@/lib/services/business.service";

const MIN_PASSWORD_LENGTH = 8;

/**
 * GET /api/v1/users — Lista usuarios del panel. Solo ADMIN.
 */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const users = await listUsers();
  return NextResponse.json({ users });
}

/**
 * POST /api/v1/users — Crea un usuario del panel (ADMIN o CAJERO). Solo ADMIN.
 * Body: { email, password, name?, role?: "ADMIN" | "CAJERO", workBusinessId? }
 * `role` por defecto es "ADMIN" (compatibilidad con el flujo previo). Si es
 * "CAJERO", `workBusinessId` es obligatorio y debe apuntar a un negocio propio
 * del admin que hace la petición.
 */
export async function POST(req: Request) {
  const { error, user } = await requireAdmin();
  if (error) return error;

  let body: {
    email?: string;
    password?: string;
    name?: string | null;
    role?: string;
    workBusinessId?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  if (!password || typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Contraseña requerida (mínimo ${MIN_PASSWORD_LENGTH} caracteres)` },
      { status: 400 }
    );
  }

  const role = body.role === "CAJERO" ? "CAJERO" : "ADMIN";

  let workBusinessId: number | null = null;
  if (role === "CAJERO") {
    if (body.workBusinessId == null || typeof body.workBusinessId !== "number") {
      return NextResponse.json({ error: "Negocio requerido para un cajero" }, { status: 400 });
    }
    const businesses = await listBusinessesByUser(user.id);
    const owned = businesses.some((b) => b.id === body.workBusinessId);
    if (!owned) {
      return NextResponse.json(
        { error: "El negocio indicado no existe o no te pertenece" },
        { status: 400 }
      );
    }
    workBusinessId = body.workBusinessId;
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 409 });
  }

  const newUser = await createUser(
    { email, password, name: body.name ?? null, role, workBusinessId },
    user.id
  );
  return NextResponse.json({ user: newUser });
}
