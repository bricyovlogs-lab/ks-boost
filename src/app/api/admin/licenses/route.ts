import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createManualLicense, resetLicenseHwid } from "@/modules/licenses/license.service";
import { adminCreateLicenseSchema, adminResetHwidSchema } from "@/validators/admin";

export async function GET() {
  await requireAdmin();
  const licenses = await prisma.license.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ licenses });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const payload = adminCreateLicenseSchema.parse(await request.json());
  const license = await createManualLicense({ email: payload.email, plan: payload.plan });

  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      licenseId: license.id,
      action: "CREATE_LICENSE_MANUAL",
      targetType: "LICENSE",
      targetId: license.id,
      description: `Licença manual criada para ${payload.email}`,
      metadataJson: payload,
    },
  });

  return NextResponse.json({ license });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  const payload = adminResetHwidSchema.parse(await request.json());
  const license = await resetLicenseHwid(payload.licenseId);

  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      licenseId: license.id,
      action: "RESET_HWID",
      targetType: "LICENSE",
      targetId: license.id,
      description: `HWID resetado para licença ${license.key}`,
      metadataJson: payload,
    },
  });

  return NextResponse.json({ license });
}
