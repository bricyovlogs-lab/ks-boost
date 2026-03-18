import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireUserApi } from "@/lib/auth";
import { activateLicense, getBestLicenseForUser, mapLicenseResultStatus, serializeLicenseResponse } from "@/modules/licenses/license.service";
import { licenseSessionPayloadSchema } from "@/validators/license";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "local";
  const rate = checkRateLimit(`license:activate:${ip}`, 60, 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ success: false, message: "Muitas tentativas. Tente novamente em instantes." }, { status: 429 });
  }

  const payload = licenseSessionPayloadSchema.parse(await request.json());

  let key = payload.key;
  if (!key) {
    const user = await requireUserApi(request);
    if (!user) {
      return NextResponse.json({ success: false, status: "invalid", message: "Não autenticado." }, { status: 401 });
    }

    const license = await getBestLicenseForUser(user.id);
    if (!license) {
      return NextResponse.json({ success: false, status: "no_license", message: "Sua conta não possui licença ativa." }, { status: 404 });
    }
    key = license.key;
  }

  const result = await activateLicense({
    key,
    hwid: payload.hwid,
    appVersion: payload.appVersion,
    machineName: payload.machineName,
    osVersion: payload.osVersion,
    ipAddress: ip,
  });

  if (!result.ok || !("license" in result) || !result.license) {
    return NextResponse.json({ success: false, status: mapLicenseResultStatus(result.code), rawStatus: result.code, message: result.message });
  }

  return NextResponse.json({
    success: true,
    status: mapLicenseResultStatus(result.code),
    rawStatus: result.code,
    message: result.message,
    license: {
      ...serializeLicenseResponse(result.license),
      key: result.license.key,
      statusNormalized: mapLicenseResultStatus(result.code),
      hwidBound: Boolean(result.license.hwid),
    },
  });
}
