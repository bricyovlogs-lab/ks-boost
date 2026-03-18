import { NextResponse } from "next/server";
import { LicensePlan, LicenseStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LICENSE_PLAN_CONFIG } from "@/lib/constants";
import { addDays } from "@/lib/utils";
import { generateUniqueLicenseKey } from "@/modules/licenses/license.generator";

export async function POST(request: Request) {
  const admin = await requireAdmin();

  try {
    const body = await request.json();
    const userId = String(body.userId || "").trim();
    const plan = String(body.plan || "LIFETIME") as LicensePlan;
    const requestedKey = String(body.userKey || "").trim().toUpperCase();
    const deviceIdsRaw = String(body.deviceIds || "").trim();

    if (!userId) {
      return NextResponse.json({ error: "Usuário não informado." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { _count: { select: { licenses: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const config = LICENSE_PLAN_CONFIG[plan];
    if (!config) {
      return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
    }

    const deviceIds = deviceIdsRaw
      ? deviceIdsRaw.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

    const licenseKey = requestedKey || await generateUniqueLicenseKey();
    const existingLicense = await prisma.license.findUnique({ where: { key: licenseKey } });
    if (existingLicense) {
      return NextResponse.json({ error: "A key informada já existe." }, { status: 400 });
    }

    const license = await prisma.license.create({
      data: {
        userId: user.id,
        key: licenseKey,
        plan,
        status: LicenseStatus.ACTIVE,
        buyerEmail: user.email,
        priceAmount: config.amount,
        durationDays: config.durationDays || undefined,
        isLifetime: config.isLifetime,
        hwid: deviceIds[0] || undefined,
        expiresAt: config.isLifetime || !config.durationDays ? null : addDays(new Date(), config.durationDays),
        notes: deviceIds.length ? `Device IDs: ${deviceIds.join(", ")}` : undefined,
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        licenseId: license.id,
        action: "ADMIN_ATTACH_LICENSE",
        targetType: "LICENSE",
        targetId: license.id,
        description: `Key manual vinculada para ${user.email}.`,
        metadataJson: {
          plan,
          key: license.key,
          hadOtherLicenses: user._count.licenses > 0,
        },
      },
    });

    return NextResponse.json({
      success: true,
      licenseKey: license.key,
    });
  } catch (error) {
    console.error("[ADMIN_ADD_LICENSE]", error);
    return NextResponse.json({ error: "Não foi possível adicionar a key." }, { status: 500 });
  }
}
