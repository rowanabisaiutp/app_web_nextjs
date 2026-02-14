import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth";
import { findUserById } from "@/lib/services/auth.service";
import { getProductById, updateProduct, deleteProduct } from "@/lib/services/menu.service";

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
 * GET /api/v1/products/[id] — Detalle producto
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const productId = parseInt(id, 10);
  if (Number.isNaN(productId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  const product = await getProductById(productId);
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  return NextResponse.json({ product });
}

/**
 * PATCH /api/v1/products/[id] — Actualiza producto. Body: { name?, categoryId?, price?, available?, imageUrl? }
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const productId = parseInt(id, 10);
  if (Number.isNaN(productId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  let body: { name?: string; categoryId?: number; price?: number; available?: boolean; imageUrl?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const product = await updateProduct(productId, {
    ...(body.name !== undefined && { name: body.name }),
    ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
    ...(body.price !== undefined && { price: body.price }),
    ...(body.available !== undefined && { available: body.available }),
    ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
  });
  return NextResponse.json({ product });
}

/**
 * DELETE /api/v1/products/[id]
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const productId = parseInt(id, 10);
  if (Number.isNaN(productId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  await deleteProduct(productId);
  return NextResponse.json({ ok: true });
}
