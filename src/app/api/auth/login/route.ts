import { NextResponse } from "next/server";
import { comparePassword, createSession, createSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/validators/auth";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const wantsJson =
      contentType.includes("application/json") ||
      request.headers.get("accept")?.includes("application/json");

    console.log("[LOGIN] content-type:", contentType);
    console.log("[LOGIN] wantsJson:", wantsJson);

    let rawEmail = "";
    let rawPassword = "";

    if (wantsJson) {
      const body = await request.json();
      rawEmail = String(body?.email || "");
      rawPassword = String(body?.password || "");
    } else {
      const formData = await request.formData();
      rawEmail = String(formData.get("email") || "");
      rawPassword = String(formData.get("password") || "");
    }

    const payload = loginSchema.parse({
      email: rawEmail.trim().toLowerCase(),
      password: rawPassword,
    });

    console.log("[LOGIN] email recebido:", payload.email);

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    console.log("[LOGIN] usuário encontrado:", !!user);

    if (!user?.passwordHash) {
      console.log("[LOGIN] usuário sem passwordHash ou não encontrado");

      if (wantsJson) {
        return NextResponse.json(
          { success: false, message: "Email ou senha inválidos." },
          { status: 401 }
        );
      }

      return NextResponse.redirect(new URL("/login?error=invalid_credentials", request.url));
    }

    const valid = await comparePassword(payload.password, user.passwordHash);
    console.log("[LOGIN] senha válida:", valid);

    if (!valid) {
      if (wantsJson) {
        return NextResponse.json(
          { success: false, message: "Email ou senha inválidos." },
          { status: 401 }
        );
      }

      return NextResponse.redirect(new URL("/login?error=invalid_credentials", request.url));
    }

    console.log("[LOGIN] criando sessão...");
    await createSession({ id: user.id, email: user.email, role: user.role });
    console.log("[LOGIN] sessão criada");

    if (wantsJson) {
      const token = await createSessionToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

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

    return NextResponse.redirect(
      new URL(user.role === "ADMIN" ? "/admin" : "/dashboard", request.url)
    );
  } catch (error) {
    console.error("[LOGIN] ERRO REAL:", error);

    if (error instanceof ZodError) {
      console.error("[LOGIN] ZodError:", error.flatten());

      return NextResponse.redirect(
        new URL("/login?error=invalid_form", request.url)
      );
    }

    return NextResponse.redirect(
      new URL("/login?error=server_error", request.url)
    );
  }
}