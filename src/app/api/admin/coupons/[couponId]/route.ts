import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ couponId: string }> },
) {
  const form = await request.formData();
  if (form.get("_method") !== "PATCH") {
    return NextResponse.redirect(new URL("/admin/coupons", request.url));
  }

  await requireAdmin();
  const { couponId } = await params;
  const action = String(form.get("action") || "");
  const isActive = action === "activate";

  await prisma.coupon.update({
    where: { id: couponId },
    data: { isActive },
  });

  return NextResponse.redirect(new URL("/admin/coupons", request.url));
}
