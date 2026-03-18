import { NextResponse } from "next/server";
import { LicensePlan, LicenseStatus, UserRole } from "@prisma/client";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LICENSE_PLAN_CONFIG } from "@/lib/constants";
import { addDays } from "@/lib/utils";
import { generateUniqueLicenseKey } from "@/modules/licenses/license.generator";

export async function POST(request: Request) {
  const admin = await requireAdmin();

  try {
    const body = await request.json();
    const name = String(body.name || "").trim() || null;
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = String(body.role || "CUSTOMER") as UserRole;
    const createLicense = Boolean(body.createLicense);
    const plan = String(body.plan || "LIFETIME") as LicensePlan;
    const requestedKey = String(body.userKey || "").trim().toUpperCase();
    const deviceIdsRaw = String(body.deviceIds || "").trim();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios." }, { status: 400 });
    }

    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: "Tipo de conta inválido." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Já existe uma conta com esse email." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name || undefined,
        email,
        passwordHash,
        emailVerified: true,
        role,
      },
    });

    if (role === "AFFILIATE" || role === "RESELLER") {
      await prisma.affiliateProfile.create({
        data: {
          userId: user.id,
          displayName: name || email.split("@")[0],
          codePrefix: email.split("@")[0].slice(0, 12).toUpperCase(),
          commissionPercent: role === "RESELLER" ? 15 : 10,
          isActive: true,
        },
      });
    }

    let createdLicense = null;

    if (createLicense) {
      const config = LICENSE_PLAN_CONFIG[plan];
      if (!config) {
        return NextResponse.json({ error: "Plano inválido para a key." }, { status: 400 });
      }

      const deviceIds = deviceIdsRaw
        ? deviceIdsRaw.split(",").map((item) => item.trim()).filter(Boolean)
        : [];

      const licenseKey = requestedKey || await generateUniqueLicenseKey();
      const existingLicense = await prisma.license.findUnique({ where: { key: licenseKey } });
      if (existingLicense) {
        return NextResponse.json({ error: "A key informada já existe." }, { status: 400 });
      }

      createdLicense = await prisma.license.create({
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
    }

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        licenseId: createdLicense?.id,
        action: "ADMIN_CREATE_USER",
        targetType: "USER",
        targetId: user.id,
        description: `Conta criada manualmente para ${user.email}${createdLicense ? " com licença vinculada" : ""}.`,
        metadataJson: {
          role,
          plan: createLicense ? plan : null,
        },
      },
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      licenseKey: createdLicense?.key || null,
    });
  } catch (error) {
    console.error("[ADMIN_CREATE_USER]", error);
    return NextResponse.json({ error: "Não foi possível criar a conta manualmente." }, { status: 500 });
  }
}
