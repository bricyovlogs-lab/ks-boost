import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createKey } from '@/lib/license'

function prefixForProduct(type: string) {
  if (type === 'OPTIMIZER') return 'VKS-OPTI'
  if (type === 'CROSSHAIR') return 'VKS-CROS'
  return 'VKS-PREC'
}

async function approveLocalPayment(localPaymentId: string, mercadoPagoPaymentId?: string) {
  const localPayment = await prisma.payment.findUnique({
    where: { id: localPaymentId },
    include: { product: true, user: true },
  })

  if (!localPayment) return { ok: true, ignored: true, reason: 'payment_not_found' }
  if (localPayment.status === 'APPROVED') return { ok: true, payment: localPayment.id, alreadyApproved: true }

  const updated = await prisma.payment.update({
    where: { id: localPayment.id },
    data: {
      status: 'APPROVED',
      ...(mercadoPagoPaymentId ? { mercadoPagoId: mercadoPagoPaymentId } : {}),
    },
  })

  await prisma.license.create({
    data: {
      code: createKey(prefixForProduct(localPayment.product.type)),
      userId: localPayment.userId,
      productId: localPayment.productId,
      lifetime: true,
      status: 'ACTIVE',
    },
  })

  return { ok: true, payment: updated.id }
}

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const mercadoPagoPaymentId = body?.data?.id?.toString() || body?.paymentId?.toString()
    const directLocalPaymentId = body?.external_reference?.toString() || body?.localPaymentId?.toString()

    if (directLocalPaymentId) {
      const result = await approveLocalPayment(directLocalPaymentId, mercadoPagoPaymentId)
      return NextResponse.json(result)
    }

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

    if (status !== 'approved') {
      const localStatus = status === 'rejected' ? 'REJECTED' : 'PENDING'
      await prisma.payment.updateMany({ where: { id: localPaymentId }, data: { status: localStatus as any } })
      return NextResponse.json({ ok: true, pending: true, status })
    }

    const result = await approveLocalPayment(localPaymentId, mercadoPagoPaymentId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('MERCADO_PAGO_WEBHOOK_ERROR', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
