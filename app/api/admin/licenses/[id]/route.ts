import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const data: any = {}
  if (body.status) data.status = body.status
  if (body.userId) data.userId = body.userId
  if (body.deviceId !== undefined) data.deviceId = body.deviceId || null
  if (body.resetDevice) data.deviceId = null
  const license = await prisma.license.update({ where: { id }, data })
  return NextResponse.json(license)
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params
  await prisma.license.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
