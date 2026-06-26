import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const data: any = {}
  if (body.code !== undefined) data.code = String(body.code).toUpperCase()
  if (body.type !== undefined) data.type = body.type
  if (body.value !== undefined) data.value = Number(body.value)
  if (body.active !== undefined) data.active = Boolean(body.active)
  if (body.resellerId !== undefined) data.resellerId = body.resellerId || null
  const coupon = await prisma.coupon.update({ where: { id }, data })
  return NextResponse.json(coupon)
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params
  await prisma.coupon.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
