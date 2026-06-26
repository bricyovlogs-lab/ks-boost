import { NextRequest } from 'next/server'
import { handleLicenseCheck } from '@/lib/app-license-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
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
  const body = await req.json()
  return handleLicenseCheck(body)
}
