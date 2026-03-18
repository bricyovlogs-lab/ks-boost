import {
  ActivationStatus,
  CouponDiscountType,
  LicensePlan,
  LicenseStatus,
  PaymentStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DOWNLOAD_URL, LICENSE_PLAN_CONFIG } from "@/lib/constants";
import { addDays } from "@/lib/utils";
import { hashHwid } from "@/lib/hwid";
import { generateUniqueLicenseKey } from "@/modules/licenses/license.generator";

export async function getOrCreateUserByEmail(email: string, name?: string | null) {
  return prisma.user.upsert({
    where: { email },
    update: name ? { name } : {},
    create: { email, name: name || undefined, emailVerified: true },
  });
}

export async function findValidCoupon(code?: string | null) {
  if (!code) return null;
  const upper = code.trim().toUpperCase();
  const coupon = await prisma.coupon.findUnique({
    where: { code: upper },
    include: { affiliateProfile: true },
  });

  if (!coupon || !coupon.isActive) return null;
  if (coupon.startsAt && coupon.startsAt > new Date()) return null;
  if (coupon.endsAt && coupon.endsAt < new Date()) return null;
  if (coupon.maxUses !== null && coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) return null;

  return coupon;
}

export function calculateDiscountedAmount(baseAmount: number, coupon: {
  discountType: CouponDiscountType;
  discountValue: number;
} | null) {
  if (!coupon) return { finalAmount: baseAmount, discountAmount: 0 };

  let discountAmount = 0;
  if (coupon.discountType === "PERCENT") {
    discountAmount = Math.round(baseAmount * (coupon.discountValue / 100));
  } else {
    discountAmount = Math.round(coupon.discountValue);
  }

  discountAmount = Math.min(discountAmount, baseAmount);
  return {
    finalAmount: Math.max(0, baseAmount - discountAmount),
    discountAmount,
  };
}

export async function registerPayment(params: {
  email: string;
  name?: string | null;
  plan: LicensePlan;
  stripeSessionId?: string | null;
  stripeCustomerId?: string | null;
  stripePriceId?: string | null;
  stripePaymentIntentId?: string | null;
  stripeEventId?: string | null;
  paid?: boolean;
  couponCode?: string | null;
}) {
  const user = await getOrCreateUserByEmail(params.email, params.name);
  const config = LICENSE_PLAN_CONFIG[params.plan];
  const coupon = await findValidCoupon(params.couponCode);
  const { finalAmount, discountAmount } = calculateDiscountedAmount(config.amount, coupon);
  const commissionCents = coupon?.affiliateProfile
    ? Math.round(finalAmount * ((coupon.affiliateProfile.commissionPercent || 0) / 100))
    : 0;

  if (params.stripeSessionId) {
    return prisma.payment.upsert({
      where: { stripeSessionId: params.stripeSessionId },
      update: {
        status: params.paid ? PaymentStatus.PAID : PaymentStatus.PENDING,
        paidAt: params.paid ? new Date() : null,
        stripeCustomerId: params.stripeCustomerId || undefined,
        stripePriceId: params.stripePriceId || undefined,
        stripePaymentIntentId: params.stripePaymentIntentId || undefined,
        stripeEventId: params.stripeEventId || undefined,
        couponId: coupon?.id,
        couponCode: coupon?.code,
        affiliateProfileId: coupon?.affiliateProfileId || undefined,
        affiliateCommissionCents: commissionCents,
        amount: finalAmount,
        originalAmount: config.amount,
        discountAmount,
      },
      create: {
        userId: user.id,
        status: params.paid ? PaymentStatus.PAID : PaymentStatus.PENDING,
        plan: params.plan,
        amount: finalAmount,
        originalAmount: config.amount,
        discountAmount,
        currency: "BRL",
        stripeSessionId: params.stripeSessionId,
        stripeCustomerId: params.stripeCustomerId || undefined,
        stripePriceId: params.stripePriceId || undefined,
        stripePaymentIntentId: params.stripePaymentIntentId || undefined,
        stripeEventId: params.stripeEventId || undefined,
        customerEmail: params.email,
        customerName: params.name || undefined,
        paidAt: params.paid ? new Date() : null,
        couponId: coupon?.id,
        couponCode: coupon?.code,
        affiliateProfileId: coupon?.affiliateProfileId || undefined,
        affiliateCommissionCents: commissionCents,
      },
    });
  }

  return prisma.payment.create({
    data: {
      userId: user.id,
      status: params.paid ? PaymentStatus.PAID : PaymentStatus.PENDING,
      plan: params.plan,
      amount: finalAmount,
      originalAmount: config.amount,
      discountAmount,
      currency: "BRL",
      customerEmail: params.email,
      customerName: params.name || undefined,
      paidAt: params.paid ? new Date() : null,
      couponId: coupon?.id,
      couponCode: coupon?.code,
      affiliateProfileId: coupon?.affiliateProfileId || undefined,
      affiliateCommissionCents: commissionCents,
    },
  });
}

export async function finalizeAffiliateCredit(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { affiliateProfile: true, coupon: true },
  });

  if (!payment?.affiliateProfileId || payment.status !== "PAID") return;

  await prisma.affiliateProfile.update({
    where: { id: payment.affiliateProfileId },
    data: {
      totalRevenueCents: { increment: payment.amount },
      totalCommissionCents: { increment: payment.affiliateCommissionCents },
    },
  });

  if (payment.couponId) {
    await prisma.coupon.update({
      where: { id: payment.couponId },
      data: {
        usedCount: { increment: 1 },
      },
    });
  }
}

export function getAvailablePayoutCents(profile: {
  totalCommissionCents: number;
  paidOutCents: number;
  pendingPayoutCents: number;
}) {
  return Math.max(0, profile.totalCommissionCents - profile.paidOutCents - profile.pendingPayoutCents);
}

export async function saveAffiliatePayoutSettings(userId: string, pixName: string, pixKey: string) {
  const profile = await prisma.affiliateProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Perfil de parceiro não encontrado.");

  return prisma.affiliateProfile.update({
    where: { id: profile.id },
    data: { payoutPixName: pixName, payoutPixKey: pixKey },
  });
}

export async function createAffiliatePayoutRequest(params: {
  userId: string;
  pixName: string;
  pixKey: string;
  amountCents: number;
}) {
  const profile = await prisma.affiliateProfile.findUnique({ where: { userId: params.userId } });
  if (!profile) throw new Error("Perfil de parceiro não encontrado.");

  const available = getAvailablePayoutCents(profile);
  if (params.amountCents > available) {
    throw new Error("Valor solicitado maior que o saldo disponível.");
  }

  const updatedProfile = await prisma.affiliateProfile.update({
    where: { id: profile.id },
    data: {
      payoutPixName: params.pixName,
      payoutPixKey: params.pixKey,
      pendingPayoutCents: { increment: params.amountCents },
    },
  });

  const request = await prisma.payoutRequest.create({
    data: {
      affiliateProfileId: profile.id,
      amountCents: params.amountCents,
      pixName: params.pixName,
      pixKey: params.pixKey,
    },
  });

  return { profile: updatedProfile, request };
}

export async function createLicenseFromPayment(params: {
  paymentId: string;
  email: string;
  name?: string | null;
  plan: LicensePlan;
}) {
  const user = await getOrCreateUserByEmail(params.email, params.name);
  const payment = await prisma.payment.findUnique({ where: { id: params.paymentId } });
  const config = LICENSE_PLAN_CONFIG[params.plan];
  const existingLicense = await prisma.license.findUnique({
    where: { paymentId: params.paymentId },
  });
  if (existingLicense) return existingLicense;

  const key = await generateUniqueLicenseKey();
  const now = new Date();
  const expiresAt = config.durationDays !== null ? addDays(now, config.durationDays) : null;

  return prisma.license.create({
    data: {
      userId: user.id,
      paymentId: params.paymentId,
      key,
      plan: params.plan,
      status: LicenseStatus.ACTIVE,
      buyerEmail: params.email,
      priceAmount: payment?.amount ?? config.amount,
      currency: "BRL",
      durationDays: config.durationDays,
      isLifetime: config.isLifetime,
      expiresAt,
    },
  });
}


export async function getBestLicenseForUser(userId: string) {
  const licenses = await prisma.license.findMany({
    where: { userId },
    include: { activations: true },
    orderBy: [{ createdAt: "desc" }],
  });

  if (!licenses.length) return null;

  const active = licenses.find((license) => license.status === LicenseStatus.ACTIVE && !isExpired(license));
  if (active) return active;

  const blocked = licenses.find((license) =>
    license.status === LicenseStatus.BLOCKED ||
    license.status === LicenseStatus.REFUNDED ||
    license.status === LicenseStatus.CANCELLED
  );
  if (blocked) return blocked;

  const expired = licenses.find((license) => isExpired(license) || license.status === LicenseStatus.EXPIRED);
  if (expired) return expired;

  return licenses[0];
}

export function mapLicenseResultStatus(code: string) {
  switch (code) {
    case "ACTIVE":
    case "ACTIVATED":
      return "active";
    case "EXPIRED":
      return "expired";
    case "HWID_MISMATCH":
      return "invalid_device";
    case "BLOCKED":
      return "blocked";
    case "INVALID":
      return "invalid";
    default:
      return code.toLowerCase();
  }
}

export async function createManualLicense(params: {
  email: string;
  plan: LicensePlan;
}) {
  const user = await getOrCreateUserByEmail(params.email);
  const config = LICENSE_PLAN_CONFIG[params.plan];
  const key = await generateUniqueLicenseKey();
  const now = new Date();

  return prisma.license.create({
    data: {
      userId: user.id,
      key,
      plan: params.plan,
      status: LicenseStatus.ACTIVE,
      buyerEmail: params.email,
      priceAmount: config.amount,
      currency: "BRL",
      durationDays: config.durationDays,
      isLifetime: config.isLifetime,
      expiresAt: config.durationDays ? addDays(now, config.durationDays) : null,
    },
  });
}

function isExpired(license: { expiresAt: Date | null; isLifetime: boolean }) {
  return !license.isLifetime && !!license.expiresAt && license.expiresAt < new Date();
}

export async function validateLicenseCore(params: { key: string; hwid?: string }) {
  const license = await prisma.license.findUnique({
    where: { key: params.key },
    include: { activations: true },
  });

  if (!license) {
    return { ok: false, code: "INVALID", message: "Licença inválida." };
  }

  if (isExpired(license)) {
    await prisma.license.update({
      where: { id: license.id },
      data: { status: LicenseStatus.EXPIRED, lastValidatedAt: new Date() },
    });
    return { ok: false, code: "EXPIRED", message: "Licença expirada.", license };
  }

  if ((license.status === LicenseStatus.BLOCKED || license.status === LicenseStatus.REFUNDED || license.status === LicenseStatus.CANCELLED)) {
    return { ok: false, code: "BLOCKED", message: "Licença bloqueada.", license };
  }

  const incomingHashedHwid = params.hwid ? hashHwid(params.hwid) : undefined;

  if (incomingHashedHwid && license.hwid && license.hwid !== incomingHashedHwid) {
    return {
      ok: false,
      code: "HWID_MISMATCH",
      message: "Licença já vinculada a outro dispositivo.",
      license,
    };
  }

  await prisma.license.update({
    where: { id: license.id },
    data: { lastValidatedAt: new Date(), lastUsedAt: new Date() },
  });

  return { ok: true, code: "ACTIVE", message: "Licença válida.", license };
}


export async function activateLicense(params: {
  key: string;
  hwid: string;
  appVersion?: string;
  ipAddress?: string;
  machineName?: string;
  osVersion?: string;
}) {
  const hashedHwid = hashHwid(params.hwid);
  const result = await validateLicenseCore({ key: params.key, hwid: params.hwid });
  if (!("license" in result) || !result.license || !result.ok) return result;
  const license = result.license;

  if (license.hwid && license.hwid !== hashedHwid) {
    return {
      ok: false,
      code: "HWID_MISMATCH",
      message: "Licença já vinculada a outro dispositivo.",
      license,
    };
  }

  if (!license.hwid) {
    const updated = await prisma.license.update({
      where: { id: license.id },
      data: {
        hwid: hashedHwid,
        activationCount: { increment: 1 },
        activatedAt: license.activatedAt || new Date(),
        status: LicenseStatus.ACTIVE,
        lastUsedAt: new Date(),
      },
    });

    await prisma.activation.upsert({
      where: {
        licenseId_hwid: { licenseId: updated.id, hwid: hashedHwid },
      },
      update: {
        appVersion: params.appVersion,
        ipAddress: params.ipAddress,
        machineName: params.machineName,
        osVersion: params.osVersion,
        status: ActivationStatus.ACTIVE,
        lastCheckAt: new Date(),
      },
      create: {
        licenseId: updated.id,
        hwid: hashedHwid,
        appVersion: params.appVersion,
        ipAddress: params.ipAddress,
        machineName: params.machineName,
        osVersion: params.osVersion,
      },
    });

    return { ok: true, code: "ACTIVATED", message: "Licença ativada com sucesso.", license: updated };
  }

  await prisma.activation.upsert({
    where: {
      licenseId_hwid: { licenseId: license.id, hwid: hashedHwid },
    },
    update: {
      appVersion: params.appVersion,
      ipAddress: params.ipAddress,
      machineName: params.machineName,
      osVersion: params.osVersion,
      status: ActivationStatus.ACTIVE,
      lastCheckAt: new Date(),
    },
    create: {
      licenseId: license.id,
      hwid: hashedHwid,
      appVersion: params.appVersion,
      ipAddress: params.ipAddress,
      machineName: params.machineName,
      osVersion: params.osVersion,
    },
  });

  return { ok: true, code: "ACTIVE", message: "Licença já ativa neste dispositivo.", license };
}


export async function deactivateLicense(params: { key: string; hwid: string }) {
  const hashedHwid = hashHwid(params.hwid);
  const license = await prisma.license.findUnique({ where: { key: params.key } });
  if (!license) return { ok: false, code: "INVALID", message: "Licença inválida." };
  if (license.hwid !== hashedHwid) {
    return { ok: false, code: "HWID_MISMATCH", message: "HWID não confere." };
  }

  await prisma.activation.updateMany({
    where: { licenseId: license.id, hwid: hashedHwid },
    data: {
      status: ActivationStatus.DEACTIVATED,
      deactivatedAt: new Date(),
      lastCheckAt: new Date(),
    },
  });

  return { ok: true, code: "DEACTIVATED", message: "Dispositivo desativado." };
}


export async function resetLicenseHwid(licenseId: string) {
  await prisma.activation.updateMany({
    where: { licenseId },
    data: {
      status: ActivationStatus.DEACTIVATED,
      deactivatedAt: new Date(),
      lastCheckAt: new Date(),
    },
  });

  return prisma.license.update({
    where: { id: licenseId },
    data: {
      hwid: null,
      hwidResetCount: { increment: 1 },
    },
  });
}

export function serializeLicenseResponse(license: {
  plan: LicensePlan;
  expiresAt: Date | null;
  isLifetime: boolean;
  status: LicenseStatus;
}) {
  return {
    planType: license.plan,
    expiresAt: license.expiresAt,
    isLifetime: license.isLifetime,
    status: license.status,
    downloadUrl: DOWNLOAD_URL,
    antiShare: {
      deviceLocked: true,
      maxDevices: 1,
    },
  };
}
