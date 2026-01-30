import { NextResponse } from "next/server";
import {
  findUserByEmail,
  createAdminUser,
} from "@/lib/services/auth.service";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {
  try {
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
