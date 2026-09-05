import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "admin_session";

if (!process.env.AUTH_SECRET) {
  throw new Error(
    "AUTH_SECRET no está definido. Configura la variable de entorno AUTH_SECRET (mínimo 32 caracteres) antes de arrancar la app."
  );
}
const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);

export type SessionPayload = {
  userId: number;
  email: string;
  role: string;
  exp: number;
};

export async function createToken(payload: Omit<SessionPayload, "exp">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export function getCookieName() {
  return COOKIE_NAME;
}
