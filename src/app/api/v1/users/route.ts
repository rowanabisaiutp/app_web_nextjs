import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/requireAdmin";
import { listUsers } from "@/lib/services/auth.service";

/**
 * GET /api/v1/users — Lista usuarios del panel. Solo ADMIN.
 */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const users = await listUsers();
  return NextResponse.json({ users });
}
