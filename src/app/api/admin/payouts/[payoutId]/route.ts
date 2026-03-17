import { NextResponse } from "next/server";
import { PayoutRequestStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ payoutId: string }>;
};

export async function POST(request: Request, context: Context) {
  const admin = await requireAdmin();
  const { payoutId } = await context.params;
  const contentType = request.headers.get("content-type") || "";
  const raw =
    contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());

  const actionType = String(raw.actionType || "");

  const payout = await prisma.payoutRequest.findUnique({
    where: { id: payoutId },
    include: { affiliateProfile: true },
  });

  if (!payout) {
    return NextResponse.json({ error: "Solicitação não encontrada." }, { status: 404 });
  }

  if (actionType === "approve" && payout.status === PayoutRequestStatus.PENDING) {
    await prisma.payoutRequest.update({
      where: { id: payoutId },
      data: {
        status: PayoutRequestStatus.APPROVED,
        reviewedAt: new Date(),
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "APPROVE_PAYOUT",
        targetType: "PAYOUT_REQUEST",
        targetId: payoutId,
        description: `Saque aprovado: ${payout.id}`,
      },
    });
  }

  if (actionType === "reject" && payout.status === PayoutRequestStatus.PENDING) {
    await prisma.$transaction([
      prisma.payoutRequest.update({
        where: { id: payoutId },
        data: {
          status: PayoutRequestStatus.REJECTED,
          reviewedAt: new Date(),
        },
      }),
      prisma.affiliateProfile.update({
        where: { id: payout.affiliateProfileId },
        data: {
          pendingPayoutCents: { decrement: payout.amountCents },
        },
      }),
      createAuditLog({
        adminId: admin.id,
        action: "REJECT_PAYOUT",
        targetType: "PAYOUT_REQUEST",
        targetId: payoutId,
        description: `Saque rejeitado: ${payout.id}`,
      }),
    ]);
  }

  if (actionType === "mark_paid" && payout.status === PayoutRequestStatus.APPROVED) {
    await prisma.$transaction([
      prisma.payoutRequest.update({
        where: { id: payoutId },
        data: {
          status: PayoutRequestStatus.PAID,
          paidAt: new Date(),
          reviewedAt: payout.reviewedAt || new Date(),
        },
      }),
      prisma.affiliateProfile.update({
        where: { id: payout.affiliateProfileId },
        data: {
          pendingPayoutCents: { decrement: payout.amountCents },
          paidOutCents: { increment: payout.amountCents },
        },
      }),
      createAuditLog({
        adminId: admin.id,
        action: "MARK_PAYOUT_PAID",
        targetType: "PAYOUT_REQUEST",
        targetId: payoutId,
        description: `Saque marcado como pago: ${payout.id}`,
      }),
    ]);
  }

  return contentType.includes("application/json")
    ? NextResponse.json({ success: true })
    : NextResponse.redirect(new URL("/admin/payouts", request.url));
}
