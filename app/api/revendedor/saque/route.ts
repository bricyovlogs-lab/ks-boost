import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserWithRole } from '@/lib/session'
import { getResellerBalance } from '@/lib/reseller'

/** Revendedor pede saque via PIX do saldo disponível. */
export async function POST(req: Request) {
  const user = await getUserWithRole(['RESELLER', 'ADMIN'])
  if (!user) return NextResponse.redirect(new URL('/login?next=/revendedor', req.url), 303)

  const form = await req.formData()
  const pixKey = String(form.get('pixKey') || '').trim().slice(0, 140)
  const amountCents = Math.round(Number(String(form.get('amount') || '0').replace(',', '.')) * 100)
  const back = (q: string) => NextResponse.redirect(new URL(`/revendedor?${q}`, req.url), 303)

  if (!pixKey) return back('saque=pix')
  if (!Number.isFinite(amountCents) || amountCents < 100) return back('saque=valor')

  const { available } = await getResellerBalance(user.id)
  if (amountCents > available) return back('saque=saldo')

  await prisma.payout.create({ data: { resellerId: user.id, pixKey, amountCents, status: 'PENDING' } })
  return back('saque=ok')
}
