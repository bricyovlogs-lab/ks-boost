import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { serializeLicenseResponse, validateLicenseCore } from "@/modules/licenses/license.service";
import { licensePayloadSchema } from "@/validators/license";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "local";
  const rate = checkRateLimit(`license:validate:${ip}`, 60, 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ success: false, message: "Muitas tentativas. Tente novamente em instantes." }, { status: 429 });
  }

  const payload = licensePayloadSchema.parse(await request.json());
  const result = await validateLicenseCore({ key: payload.key, hwid: payload.hwid });

  if (!result.ok || !("license" in result) || !result.license) {
    return NextResponse.json({ success: false, status: result.code, message: result.message });
  }

  return NextResponse.json({
    success: true,
    status: result.code,
    message: result.message,
    license: serializeLicenseResponse(result.license),
  });
}
