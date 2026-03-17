import { NextResponse } from "next/server";
import { comparePassword, createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/validators/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const payload = loginSchema.parse({
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
  });

  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user?.passwordHash) return NextResponse.redirect(new URL("/login", request.url));

  const valid = await comparePassword(payload.password, user.passwordHash);
  if (!valid) return NextResponse.redirect(new URL("/login", request.url));

  await createSession({ id: user.id, email: user.email, role: user.role });
  return NextResponse.redirect(new URL(user.role === "ADMIN" ? "/admin" : "/dashboard", request.url));
}
