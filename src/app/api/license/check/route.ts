import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { serializeLicenseResponse, validateLicenseCore } from "@/modules/licenses/license.service";
import { licenseCheckSchema } from "@/validators/license";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "local";
  const rate = checkRateLimit(`license:check:${ip}`, 60, 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ success: false, message: "Muitas tentativas. Tente novamente em instantes." }, { status: 429 });
  }

  const payload = licenseCheckSchema.parse(await request.json());
  const result = await validateLicenseCore(payload);

  return NextResponse.json({
    success: result.ok,
    status: result.code,
    message: result.message,
    license: "license" in result && result.license ? serializeLicenseResponse(result.license) : null,
  });
}
