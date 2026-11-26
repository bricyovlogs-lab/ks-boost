import { prisma } from '@/lib/prisma'

/** Comissão do revendedor / criador de conteúdo sobre o valor que o cliente pagou. */
export const RESELLER_COMMISSION_PERCENT = 35

export function money(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/** Valida o cupom e calcula o desconto. Cupom do próprio comprador não vale. */
export async function resolveCoupon(code: string | null | undefined, priceCents: number, buyerId?: string) {
  const clean = String(code || '').trim().toUpperCase()
  if (!clean) return { coupon: null, discountCents: 0, error: null as string | null }
  const coupon = await prisma.coupon.findUnique({ where: { code: clean } })
  if (!coupon || !coupon.active) return { coupon: null, discountCents: 0, error: 'Cupom inválido ou expirado.' }
  if (buyerId && coupon.resellerId === buyerId) return { coupon: null, discountCents: 0, error: 'Você não pode usar o seu próprio cupom.' }
  const raw = coupon.type === 'PERCENT' ? Math.round(priceCents * (coupon.value / 100)) : coupon.value * 100
  const discountCents = Math.max(0, Math.min(raw, priceCents - 100)) // nunca abaixo de R$ 1,00
  return { coupon, discountCents, error: null as string | null }
}

/** Saldo do revendedor: comissões − saques pedidos ou pagos. */
export async function getResellerBalance(resellerId: string) {
  const [commissions, payouts] = await Promise.all([
    prisma.resellerCommission.aggregate({ _sum: { amountCents: true }, where: { resellerId } }),
    prisma.payout.aggregate({ _sum: { amountCents: true }, where: { resellerId, status: { in: ['PENDING', 'PAID'] } } }),
  ])
  const earned = commissions._sum.amountCents || 0
  const withdrawn = payouts._sum.amountCents || 0
  return { earned, withdrawn, available: Math.max(0, earned - withdrawn) }
}
