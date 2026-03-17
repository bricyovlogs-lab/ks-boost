import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyPayoutRequest } from "@/lib/discord";
import { createAffiliatePayoutRequest, getAvailablePayoutCents } from "@/modules/licenses/license.service";
import { createPayoutRequestSchema } from "@/validators/payout";

export async function GET() {
  const user = await requireUser();
  const profile = await prisma.affiliateProfile.findUnique({
    where: { userId: user.id },
    include: {
      payoutRequests: {
        orderBy: { requestedAt: "desc" },
        take: 20,
      },
    },
  });

  if (!profile) {
    return NextResponse.json({ profile: null, payoutRequests: [] });
  }

  return NextResponse.json({
    profile: {
      availablePayoutCents: getAvailablePayoutCents(profile),
      payoutPixName: profile.payoutPixName,
      payoutPixKey: profile.payoutPixKey,
      totalCommissionCents: profile.totalCommissionCents,
      pendingPayoutCents: profile.pendingPayoutCents,
      paidOutCents: profile.paidOutCents,
    },
    payoutRequests: profile.payoutRequests,
  });
}

export async function POST(request: Request) {
  const user = await requireUser();
  const contentType = request.headers.get("content-type") || "";
  const raw =
    contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());

  const ip = request.headers.get("x-forwarded-for") || "local";
  const rate = checkRateLimit(`payout:${user.id}:${ip}`, 5, 60 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Muitas solicitações de saque. Tente novamente mais tarde." }, { status: 429 });
  }

  const payload = createPayoutRequestSchema.parse(raw);
  if (payload.amountCents < 1000) {
    return NextResponse.json({ error: "O saque mínimo é de R$ 10,00." }, { status: 400 });
  }

  const result = await createAffiliatePayoutRequest({
    userId: user.id,
    pixName: payload.pixName,
    pixKey: payload.pixKey,
    amountCents: payload.amountCents,
  });

  await notifyPayoutRequest({
    partnerEmail: user.email,
    amountCents: payload.amountCents,
    pixName: payload.pixName,
    pixKey: payload.pixKey,
  });

  return contentType.includes("application/json")
    ? NextResponse.json({ success: true, payoutRequest: result.request })
    : NextResponse.redirect(new URL("/influencer", request.url));
}
