import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createKey } from '@/lib/license'
import { RESELLER_COMMISSION_PERCENT } from '@/lib/reseller'

function prefixForProduct(type: string) {
  if (type === 'OPTIMIZER') return 'VKS-OPTI'
  if (type === 'CROSSHAIR') return 'VKS-CROS'
  return 'VKS-PREC'
}

async function approveLocalPayment(localPaymentId: string, mercadoPagoPaymentId: string, paidCents: number) {
  const localPayment = await prisma.payment.findUnique({
    where: { id: localPaymentId },
    include: { product: true, user: true },
  })

  if (!localPayment) return { ok: true, ignored: true, reason: 'payment_not_found' }
  if (localPayment.status === 'APPROVED') return { ok: true, payment: localPayment.id, alreadyApproved: true }

  // Segurança: o valor pago no Mercado Pago tem que bater com o pedido
  if (paidCents + 1 < localPayment.amountCents) {
    console.error('PAGAMENTO_COM_VALOR_MENOR', { localPaymentId, paidCents, esperado: localPayment.amountCents })
    return { ok: true, ignored: true, reason: 'amount_mismatch' }
  }

  // Aprova só uma vez, mesmo se o Mercado Pago avisar duas vezes ao mesmo tempo
  const claimed = await prisma.payment.updateMany({
    where: { id: localPayment.id, status: { not: 'APPROVED' } },
    data: {
      status: 'APPROVED',
      ...(mercadoPagoPaymentId ? { mercadoPagoId: mercadoPagoPaymentId } : {}),
    },
  })
  if (claimed.count === 0) return { ok: true, payment: localPayment.id, alreadyApproved: true }
  const updated = localPayment

  await prisma.license.create({
    data: {
      code: createKey(prefixForProduct(localPayment.product.type)),
      userId: localPayment.userId,
      productId: localPayment.productId,
      lifetime: true,
      status: 'ACTIVE',
      paymentId: localPayment.id,
    },
  })

  // Comissão de 35% para o revendedor / criador dono do cupom
  if (localPayment.resellerId) {
    await prisma.resellerCommission.create({
      data: {
        resellerId: localPayment.resellerId,
        paymentId: localPayment.id,
        amountCents: Math.round(localPayment.amountCents * (RESELLER_COMMISSION_PERCENT / 100)),
      },
    })
  }

  return { ok: true, payment: updated.id }
}

async function revokePayment(localPaymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: localPaymentId } })
  if (!payment) return
  await prisma.payment.update({ where: { id: payment.id }, data: { status: 'REJECTED' } })
  await prisma.license.updateMany({ where: { paymentId: payment.id }, data: { status: 'BLOCKED' } })
  await prisma.resellerCommission.deleteMany({ where: { paymentId: payment.id } })
  console.warn('PAGAMENTO_ESTORNADO_KEY_BLOQUEADA', payment.id)
}

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const mercadoPagoPaymentId = body?.data?.id?.toString() || body?.paymentId?.toString()
    // Segurança: o pagamento só é aprovado depois de conferido direto na API do Mercado Pago.
    // (Antes dava para mandar { localPaymentId } e liberar uma key sem pagar.)

    if (!mercadoPagoPaymentId) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'no_payment_id' })
    }

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!token) {
      return NextResponse.json({ ok: false, message: 'Mercado Pago token ausente.' }, { status: 500 })
    }

    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${mercadoPagoPaymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    const mpPayment = await mpResponse.json()

    if (!mpResponse.ok) {
      console.error('MERCADO_PAGO_PAYMENT_READ_ERROR', mpPayment)
      return NextResponse.json({ ok: true, ignored: true, reason: 'mp_read_failed' })
    }

    const localPaymentId = mpPayment?.external_reference?.toString()
    const status = String(mpPayment?.status || '').toLowerCase()

    if (!localPaymentId) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'no_external_reference' })
    }

    // Estorno / chargeback / cancelamento depois de aprovado: bloqueia a key e tira a comissão
    if (['refunded', 'charged_back', 'cancelled'].includes(status)) {
      await revokePayment(localPaymentId)
      return NextResponse.json({ ok: true, revoked: true, status })
    }

    if (status !== 'approved') {
      // Nunca "desaprova" um pagamento já aprovado por causa de um aviso atrasado
      const localStatus = status === 'rejected' ? 'REJECTED' : 'PENDING'
      await prisma.payment.updateMany({ where: { id: localPaymentId, status: { not: 'APPROVED' } }, data: { status: localStatus as any } })
      return NextResponse.json({ ok: true, pending: true, status })
    }

    const paidCents = Math.round(Number(mpPayment?.transaction_amount || 0) * 100)
    const result = await approveLocalPayment(localPaymentId, mercadoPagoPaymentId, paidCents)
    return NextResponse.json(result)
  } catch (error) {
    console.error('MERCADO_PAGO_WEBHOOK_ERROR', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
