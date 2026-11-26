import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../lib/prisma'
import { denyIfNotAdmin } from '@/lib/session'

export async function GET() {
  const denied = await denyIfNotAdmin()
  if (denied) return denied
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    omit: { passwordHash: true },
    include: { licenses: { include: { product: true } }, coupons: true, payments: true },
  })
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const denied = await denyIfNotAdmin()
  if (denied) return denied
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
  const { passwordHash: _hidden, ...safe } = user
  return NextResponse.json(safe)
}
