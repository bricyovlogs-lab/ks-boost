import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/validators/auth";

function redirectWithError(request: Request, code: string) {
  const url = new URL("/register", request.url);
  url.searchParams.set("error", code);
  return NextResponse.redirect(url);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const payload = registerSchema.parse({
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim().toLowerCase(),
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
  } catch (error) {
    console.error("[AUTH_REGISTER_ERROR]", error);

    if (error instanceof ZodError) {
      return redirectWithError(request, "invalid_payload");
    }

    return redirectWithError(request, "server_error");
  }
}
