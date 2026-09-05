import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/requireAdmin";
import { listClients, createClient } from "@/lib/services/client.service";

/**
 * GET /api/v1/clients — Lista clientes. Query: search (opcional)
 */
export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? undefined;
  const clients = await listClients(search || undefined);
  return NextResponse.json({ clients });
}

/**
 * POST /api/v1/clients — Crea cliente. Body: { email, password, name?, phone?, address? }
 */
export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  let body: {
    email?: string;
    password?: string;
    name?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const email = body.email?.trim();
  const password = body.password;
  if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  if (!password || typeof password !== "string" || password.length < 6) {
    return NextResponse.json({ error: "Contraseña requerida (mínimo 6 caracteres)" }, { status: 400 });
  }
  try {
    const client = await createClient({
      email,
      password,
      name: body.name ?? null,
      phone: body.phone ?? null,
      address: body.address ?? null,
    });
    return NextResponse.json({ client });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al crear cliente";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
