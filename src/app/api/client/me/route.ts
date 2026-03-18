import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBestLicenseForUser, mapLicenseResultStatus, serializeLicenseResponse } from "@/modules/licenses/license.service";

export async function GET(request: Request) {
  const user = await getSessionUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ success: false, message: "Não autenticado." }, { status: 401 });
  }

  const [licenses, payments, currentLicense] = await Promise.all([
    prisma.license.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.payment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    getBestLicenseForUser(user.id),
  ]);

  const license = currentLicense
    ? {
        ...serializeLicenseResponse(currentLicense),
        key: currentLicense.key,
        statusNormalized: mapLicenseResultStatus(currentLicense.status),
        hwidBound: Boolean(currentLicense.hwid),
      }
    : null;

  return NextResponse.json({ success: true, user, license, licenses, payments });
}
