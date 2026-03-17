import { jwtVerify } from "jose";
import { UserRole } from "@prisma/client";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET não configurado.");
  return new TextEncoder().encode(secret);
}

export type SessionTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export async function verifySessionToken(token: string): Promise<SessionTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    if (!payload.sub || !payload.email || !payload.role) {
      return null;
    }

    return {
      sub: String(payload.sub),
      email: String(payload.email),
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}
