import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { licenses: { include: { product: true } }, coupons: true, payments: true },
  })
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const body = await req.json()
  const passwordHash = await bcrypt.hash(body.password || 'VKS123456', 10)
  const user = await prisma.user.create({
    data: {
      name: body.name || null,
      email: body.email,
      passwordHash,
      role: body.role || 'CUSTOMER',
      status: body.status || 'ACTIVE',
    },
  })
  return NextResponse.json(user)
}
