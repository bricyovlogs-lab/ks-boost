import { NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/validators/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const payload = registerSchema.parse({
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
  });

  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) return NextResponse.redirect(new URL("/login", request.url));

  const passwordHash = await hashPassword(payload.password);
  const user = await prisma.user.create({
    data: {
      name: payload.name || undefined,
      email: payload.email,
      passwordHash,
      emailVerified: true,
    },
  });

  await createSession({ id: user.id, email: user.email, role: user.role });
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
