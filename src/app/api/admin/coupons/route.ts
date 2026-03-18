import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminCreateCouponSchema } from "@/validators/admin";

function errorResponse(request: Request, contentType: string, message: string, status = 400, details?: unknown) {
  if (contentType.includes("application/json")) {
    return NextResponse.json({ error: message, details }, { status });
  }

  const url = new URL("/admin/coupons", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, 303);
}

export async function GET() {
  await requireAdmin();
  const coupons = await prisma.coupon.findMany({
    include: { affiliateProfile: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ coupons });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const contentType = request.headers.get("content-type") || "";
  const raw =
    contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());

  try {
    const payload = adminCreateCouponSchema.parse({
      ...raw,
      code: typeof raw.code === "string" ? raw.code.trim().toUpperCase() : raw.code,
      label: typeof raw.label === "string" ? raw.label.trim() : raw.label,
      affiliateEmail: typeof raw.affiliateEmail === "string" ? raw.affiliateEmail.trim().toLowerCase() : raw.affiliateEmail,
      maxUses: raw.maxUses === "" ? undefined : raw.maxUses,
      discountValue: raw.discountValue === "" ? undefined : raw.discountValue,
    });

    let affiliateProfileId: string | undefined = undefined;

    if (payload.affiliateEmail) {
      const user = await prisma.user.findUnique({
        where: { email: payload.affiliateEmail },
        include: { affiliateProfile: true },
      });

      if (!user) {
        return errorResponse(request, contentType, "Usuário do parceiro não encontrado.", 400);
      }

      if (!user.affiliateProfile) {
        return errorResponse(request, contentType, "O usuário informado não possui perfil de afiliado/revendedor.", 400);
      }

      affiliateProfileId = user.affiliateProfile.id;
    }

    const existing = await prisma.coupon.findUnique({
      where: { code: payload.code },
      select: { id: true },
    });

    if (existing) {
      return errorResponse(request, contentType, "Já existe um cupom com esse código.", 400);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: payload.code,
        label: payload.label || undefined,
        discountType: payload.discountType,
        discountValue: payload.discountValue,
        maxUses: payload.maxUses,
        affiliateProfileId,
        isActive: true,
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "CREATE_COUPON",
        targetType: "COUPON",
        targetId: coupon.id,
        description: `Cupom ${coupon.code} criado`,
        metadataJson: {
          code: payload.code,
          label: payload.label || null,
          discountType: payload.discountType,
          discountValue: payload.discountValue,
          affiliateEmail: payload.affiliateEmail || null,
          maxUses: payload.maxUses ?? null,
        } as Prisma.InputJsonValue,
      },
    });

    return contentType.includes("application/json")
      ? NextResponse.json({ success: true, coupon })
      : NextResponse.redirect(new URL("/admin/coupons?success=1", request.url), 303);
  } catch (error) {
    console.error("[ADMIN_COUPONS_POST]", error);

    if (error instanceof ZodError) {
      const message = error.issues[0]?.message || "Dados inválidos para criar cupom.";
      return errorResponse(request, contentType, message, 400, error.issues);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return errorResponse(request, contentType, "Já existe um cupom com esse código.", 400);
      }
      return errorResponse(request, contentType, "Erro de banco de dados ao criar cupom.", 500, error.code);
    }

    return errorResponse(request, contentType, "Erro interno ao criar cupom.", 500);
  }
}
