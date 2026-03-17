import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resetLicenseHwid } from "@/modules/licenses/license.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ licenseId: string }> },
) {
  const url = new URL(request.url);
  const form = await request.formData();
  if (form.get("_method") !== "PATCH") {
    return NextResponse.redirect(new URL("/admin/licenses", request.url));
  }

  const { licenseId } = await params;
  const admin = await requireAdmin();
  const action = String(form.get("action") || "");

  if (action === "reset_hwid") {
    const license = await resetLicenseHwid(licenseId);
    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        licenseId,
        action: "RESET_HWID",
        targetType: "LICENSE",
        targetId: licenseId,
        description: `HWID resetado para ${license.key}`,
      },
    });
  } else if (action === "block") {
    await prisma.license.update({ where: { id: licenseId }, data: { status: "BLOCKED" } });
  } else if (action === "unblock") {
    await prisma.license.update({ where: { id: licenseId }, data: { status: "ACTIVE" } });
  }

  return NextResponse.redirect(new URL("/admin/licenses", request.url));
}
