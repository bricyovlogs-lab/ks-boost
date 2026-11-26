import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { denyIfNotAdmin } from '@/lib/session'

type Params = { params: Promise<{ id: string }> }

/** Admin marca o saque como pago ou recusado (formulário da página /admin/saques). */
export async function POST(req: Request, { params }: Params) {
  const denied = await denyIfNotAdmin()
  if (denied) return denied
  const { id } = await params
  const form = await req.formData()
  const status = String(form.get('status') || '')
  if (status === 'PAID' || status === 'REJECTED') {
    await prisma.payout.updateMany({ where: { id, status: 'PENDING' }, data: { status } })
  }
  return NextResponse.redirect(new URL('/admin/saques', req.url), 303)
}
