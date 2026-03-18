import { NextResponse } from "next/server";
import { comparePassword, createSession, createSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/validators/auth";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const wantsJson = contentType.includes("application/json") || request.headers.get("accept")?.includes("application/json");

  const payload = wantsJson
    ? loginSchema.parse(await request.json())
    : loginSchema.parse({
        email: String((await request.formData()).get("email") || ""),
        password: String((await request.formData()).get("password") || ""),
      });

  const user = await prisma.user.findUnique({ where: { email: payload.email } });

  if (!user?.passwordHash) {
    if (wantsJson) {
      return NextResponse.json({ success: false, message: "Email ou senha inválidos." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const valid = await comparePassword(payload.password, user.passwordHash);
  if (!valid) {
    if (wantsJson) {
      return NextResponse.json({ success: false, message: "Email ou senha inválidos." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  await createSession({ id: user.id, email: user.email, role: user.role });

  if (wantsJson) {
    const token = await createSessionToken({ id: user.id, email: user.email, role: user.role });
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  }

  return NextResponse.redirect(new URL(user.role === "ADMIN" ? "/admin" : "/dashboard", request.url));
}

