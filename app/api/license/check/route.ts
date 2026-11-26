import { NextRequest } from 'next/server'
import { handleLicenseCheck } from '@/lib/app-license-auth'
import { allow, clientIp, tooMany } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// 60 verificações por minuto por IP: o app usa poucas, um robô testando keys é barrado
export async function GET(req: NextRequest) {
  if (!allow(`license:${clientIp(req)}`, 60, 60_000)) return tooMany()
  const { searchParams } = new URL(req.url)
  return handleLicenseCheck({
    token: searchParams.get('token') || undefined,
    email: searchParams.get('email') || undefined,
    key: searchParams.get('key') || undefined,
    product_type: searchParams.get('product_type') || undefined,
    productType: searchParams.get('productType') || undefined,
    device_id: searchParams.get('device_id') || undefined,
    deviceId: searchParams.get('deviceId') || undefined,
    hwid: searchParams.get('hwid') || undefined,
  })
}

export async function POST(req: Request) {
  if (!allow(`license:${clientIp(req)}`, 60, 60_000)) return tooMany()
  const body = await req.json().catch(() => ({}))
  return handleLicenseCheck(body)
}
