import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminCreateCouponSchema } from "@/validators/admin";

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

  const payload = adminCreateCouponSchema.parse(raw);

  let affiliateProfileId: string | undefined = undefined;
  if (payload.affiliateEmail) {
    const user = await prisma.user.findUnique({
      where: { email: payload.affiliateEmail },
      include: { affiliateProfile: true },
    });

    if (user?.affiliateProfile) {
      affiliateProfileId = user.affiliateProfile.id;
    }
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: payload.code.toUpperCase(),
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
      metadataJson: payload,
    },
  });

  return contentType.includes("application/json")
    ? NextResponse.json({ coupon })
    : NextResponse.redirect(new URL("/admin/coupons", request.url));
}
