import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

function makeKey(productType: string) {
  return `VKS-${productType.replace('_', '').slice(0, 4)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now().toString().slice(-5)}`
}

export async function GET() {
  const licenses = await prisma.license.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true, product: true },
  })
  return NextResponse.json(licenses)
}

export async function POST(req: Request) {
  const body = await req.json()
  const product = await prisma.product.findUnique({ where: { type: body.productType } })
  if (!product) return NextResponse.json({ error: 'Produto não encontrado. Rode npm run seed.' }, { status: 400 })
  const license = await prisma.license.create({
    data: {
      code: body.code || makeKey(body.productType),
      productId: product.id,
      userId: body.userId,
      status: body.status || 'ACTIVE',
      lifetime: body.lifetime !== false,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    },
  })
  return NextResponse.json(license)
}
