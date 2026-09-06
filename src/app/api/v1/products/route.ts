import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/requireAdmin";
import { listProducts, createProduct } from "@/lib/services/menu.service";

/**
 * GET /api/v1/products — Lista productos. Query: categoryId (opcional)
 */
export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const categoryIdParam = searchParams.get("categoryId");
  const categoryId = categoryIdParam ? parseInt(categoryIdParam, 10) : undefined;
  const products = await listProducts(Number.isNaN(categoryId!) ? undefined : categoryId);
  return NextResponse.json({ products });
}

/**
 * POST /api/v1/products — Crea producto. Body: { name, categoryId, price, available?, imageUrl? }
 */
export async function POST(req: Request) {
  const { error, user } = await requireAdmin();
  if (error) return error;
  let body: { name?: string; categoryId?: number; price?: number; available?: boolean; imageUrl?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const name = body.name?.trim();
  const categoryId = body.categoryId;
  const price = body.price;
  if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  if (categoryId == null || typeof categoryId !== "number") return NextResponse.json({ error: "Categoría requerida" }, { status: 400 });
  if (price == null || typeof price !== "number" || price < 0) return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
  const product = await createProduct(
    {
      name,
      categoryId,
      price,
      available: body.available ?? true,
      imageUrl: body.imageUrl ?? null,
    },
    user.id
  );
  return NextResponse.json({ product });
}
