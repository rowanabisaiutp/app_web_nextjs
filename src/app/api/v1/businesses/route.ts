import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/requireAdmin";
import { listBusinessesByUser, createBusiness } from "@/lib/services/business.service";

/**
 * GET /api/v1/businesses — Lista los negocios del admin logueado.
 */
export async function GET() {
  const { error, user } = await requireAdmin();
  if (error) return error;
  const businesses = await listBusinessesByUser(user.id);
  return NextResponse.json({ businesses });
}

/**
 * POST /api/v1/businesses — Registra un negocio del admin logueado.
 * Body: { name, address?, latitude?, longitude? }
 */
export async function POST(req: Request) {
  const { error, user } = await requireAdmin();
  if (error) return error;
  let body: { name?: string; address?: string | null; latitude?: number | null; longitude?: number | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

  try {
    const business = await createBusiness({
      userId: user.id,
      name,
      address: body.address ?? null,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
    });
    return NextResponse.json({ business });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al crear negocio";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
