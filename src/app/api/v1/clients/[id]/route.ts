import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { findUserById } from "@/lib/services/auth.service";
import { getClientById, updateClient, deleteClient } from "@/lib/services/client.service";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;
  if (!token) return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  const payload = await verifyToken(token);
  if (!payload) return { error: NextResponse.json({ error: "Sesión inválida" }, { status: 401 }) };
  const user = await findUserById(payload.userId);
  if (!user || user.role !== "ADMIN") return { error: NextResponse.json({ error: "Sin permiso" }, { status: 403 }) };
  return { error: null };
}

/**
 * GET /api/v1/clients/[id] — Detalle del cliente
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const clientId = parseInt(id, 10);
  if (Number.isNaN(clientId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  const client = await getClientById(clientId);
  if (!client) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  return NextResponse.json({ client });
}

/**
 * PATCH /api/v1/clients/[id] — Actualiza cliente. Body: { name?, phone?, address?, blocked? }
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const clientId = parseInt(id, 10);
  if (Number.isNaN(clientId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  let body: { name?: string | null; phone?: string | null; address?: string | null; blocked?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const client = await updateClient(clientId, {
    ...(body.name !== undefined && { name: body.name }),
    ...(body.phone !== undefined && { phone: body.phone }),
    ...(body.address !== undefined && { address: body.address }),
    ...(body.blocked !== undefined && { blocked: body.blocked }),
  });
  return NextResponse.json({ client });
}

/**
 * DELETE /api/v1/clients/[id] — Elimina cliente. Falla si tiene pedidos.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const clientId = parseInt(id, 10);
  if (Number.isNaN(clientId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  try {
    await deleteClient(clientId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "No se puede eliminar: tiene pedidos asociados o no existe." },
      { status: 400 }
    );
  }
}
