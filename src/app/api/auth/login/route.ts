import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { comparePassword, createSession, createSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/validators/auth";

function redirectWithError(request: Request, code: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", code);
  return NextResponse.redirect(url);
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const wantsJson =
    contentType.includes("application/json") ||
    request.headers.get("accept")?.includes("application/json");

  try {
    const rawPayload = wantsJson
      ? await request.json()
      : {
          email: String((await request.formData()).get("email") || ""),
          password: String((await request.formData()).get("password") || ""),
        };

    const payload = loginSchema.parse({
      email: String(rawPayload.email || "").trim().toLowerCase(),
      password: String(rawPayload.password || ""),
    });

    const user = await prisma.user.findUnique({ where: { email: payload.email } });

    if (!user?.passwordHash) {
      if (wantsJson) {
        return NextResponse.json(
          { success: false, message: "Email ou senha inválidos." },
          { status: 401 }
        );
      }
      return redirectWithError(request, "invalid_credentials");
    }

    const valid = await comparePassword(payload.password, user.passwordHash);
    if (!valid) {
      if (wantsJson) {
        return NextResponse.json(
          { success: false, message: "Email ou senha inválidos." },
          { status: 401 }
        );
      }
      return redirectWithError(request, "invalid_credentials");
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
  } catch (error) {
    console.error("[AUTH_LOGIN_ERROR]", error);

    if (error instanceof ZodError) {
      if (wantsJson) {
        return NextResponse.json(
          { success: false, message: "Dados de login inválidos.", issues: error.flatten() },
          { status: 400 }
        );
      }
      return redirectWithError(request, "invalid_payload");
    }

    if (wantsJson) {
      return NextResponse.json(
        { success: false, message: "Erro interno ao realizar login." },
        { status: 500 }
      );
    }

    return redirectWithError(request, "server_error");
  }
}
