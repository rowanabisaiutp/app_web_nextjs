import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken, getCookieName } from "@/lib/auth";
import {
  findUserByEmail,
  findUserById,
  createAdminUser,
} from "@/lib/services/auth.service";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      const cookieStore = await cookies();
      const token = cookieStore.get(getCookieName())?.value;
      const payload = token ? await verifyToken(token) : null;
      const requester = payload ? await findUserById(payload.userId) : null;
      if (!requester || requester.role !== "ADMIN") {
        return NextResponse.json(
          { error: "No autorizado. Solo un administrador puede crear nuevas cuentas." },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      return NextResponse.json(
        { error: "Email no válido" },
        { status: 400 }
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` },
        { status: 400 }
      );
    }

    const existing = await findUserByEmail(trimmedEmail);
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email" },
        { status: 409 }
      );
    }

    const user = await createAdminUser({
      email: trimmedEmail,
      password,
      name: typeof name === "string" ? name : undefined,
    });

    return NextResponse.json({
      ok: true,
      user,
      message: "Cuenta creada. Ya puedes iniciar sesión.",
    });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json(
      { error: "Error al crear la cuenta" },
      { status: 500 }
    );
  }
}
