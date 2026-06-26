import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  const coupons = await prisma.coupon.findMany({ orderBy: { id: 'desc' }, include: { reseller: true } })
  return NextResponse.json(coupons)
}

export async function POST(req: Request) {
  const body = await req.json()
  const coupon = await prisma.coupon.create({
    data: {
      code: String(body.code || '').toUpperCase(),
      type: body.type || 'PERCENT',
      value: Number(body.value || 0),
      active: body.active !== false,
      resellerId: body.resellerId || null,
    },
  })
  return NextResponse.json(coupon)
}
