import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/requireAdmin";
import { listCategories, createCategory } from "@/lib/services/menu.service";

/**
 * GET /api/v1/categories — Lista categorías. Solo ADMIN.
 */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const categories = await listCategories();
  return NextResponse.json({ categories });
}

/**
 * POST /api/v1/categories — Crea categoría. Solo ADMIN. Body: { name }
 */
export async function POST(req: Request) {
  const { error, user } = await requireAdmin();
  if (error) return error;
  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  const category = await createCategory(name, user.id);
  return NextResponse.json({ category });
}
