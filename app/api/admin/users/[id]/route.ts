import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../../lib/prisma'
import { denyIfNotAdmin } from '@/lib/session'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const denied = await denyIfNotAdmin()
  if (denied) return denied
  const { id } = await params
  const body = await req.json()
  const data: any = {}
  if (body.name !== undefined) data.name = body.name
  if (body.email !== undefined) data.email = body.email
  if (body.role !== undefined) data.role = body.role
  if (body.status !== undefined) data.status = body.status
  if (body.password) data.passwordHash = await bcrypt.hash(body.password, 10)
  const user = await prisma.user.update({ where: { id }, data })
  const { passwordHash: _hidden, ...safe } = user
  return NextResponse.json(safe)
}

export async function DELETE(_: Request, { params }: Params) {
  const denied = await denyIfNotAdmin()
  if (denied) return denied
  const { id } = await params
  await prisma.license.deleteMany({ where: { userId: id } })
  await prisma.payment.deleteMany({ where: { userId: id } })
  await prisma.coupon.deleteMany({ where: { resellerId: id } })
  await prisma.payout.deleteMany({ where: { resellerId: id } })
  await prisma.resellerCommission.deleteMany({ where: { resellerId: id } })
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
