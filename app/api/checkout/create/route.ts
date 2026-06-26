import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { normalizeProductType, productCatalog } from '@/lib/products'

type JwtUser = { id: string; email: string; name?: string; role: string }

function getBaseUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || req.nextUrl.origin
}

function parseToken(req: NextRequest) {
  const token = req.cookies.get('vks_token')?.value
  if (!token) return null
  try {
    return jwt.verify(token, process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'vksboostsupersecret') as JwtUser
  } catch {
    return null
  }
}

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const baseUrl = getBaseUrl(req)
  const session = parseToken(req)

  if (!session?.id) {
    return NextResponse.redirect(new URL('/login', baseUrl), 303)
  }

  const form = await req.formData()
  const acceptedTerms = form.get('acceptedTerms') === 'yes'
  const productType = normalizeProductType(String(form.get('product') || 'OPTIMIZER'))
  const catalog = productCatalog[productType]

  if (!acceptedTerms) {
    return NextResponse.redirect(new URL(`/checkout?product=${productType}&error=terms`, baseUrl), 303)
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } })
  if (!user || user.status !== 'ACTIVE') {
    return NextResponse.redirect(new URL('/login', baseUrl), 303)
  }

  const product = await prisma.product.upsert({
    where: { type: productType },
    update: { name: catalog.name, priceCents: catalog.priceCents },
    create: { type: productType, name: catalog.name, priceCents: catalog.priceCents },
  })

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      productId: product.id,
      amountCents: catalog.priceCents,
      status: 'PENDING',
    },
  })

  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) {
    return NextResponse.redirect(new URL(`/checkout?product=${productType}&error=mercadopago`, baseUrl), 303)
  }

  const preferencePayload = {
    items: [
      {
        id: product.type,
        title: product.name,
        description: `Key vitalícia ${product.name} - VKS BOOST`,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: catalog.priceCents / 100,
      },
    ],
    payer: {
      name: user.name || user.email,
      email: user.email,
    },
    external_reference: payment.id,
    notification_url: `${baseUrl}/api/mercadopago/webhook`,
    back_urls: {
      success: `${baseUrl}/cliente?payment=success`,
      pending: `${baseUrl}/cliente?payment=pending`,
      failure: `${baseUrl}/checkout?product=${productType}&error=payment`,
    },
    auto_return: 'approved',
    statement_descriptor: 'VKS BOOST',
  }

  try {
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferencePayload),
    })

    const preference = await mpResponse.json()

    if (!mpResponse.ok || !preference?.init_point) {
      console.error('MERCADO_PAGO_PREFERENCE_ERROR', preference)
      return NextResponse.redirect(new URL(`/checkout?product=${productType}&error=mercadopago`, baseUrl), 303)
    }

    await prisma.payment.update({ where: { id: payment.id }, data: { mercadoPagoId: `pref_${preference.id}` } })
    return NextResponse.redirect(preference.init_point, 303)
  } catch (error) {
    console.error('CHECKOUT_CREATE_ERROR', error)
    return NextResponse.redirect(new URL(`/checkout?product=${productType}&error=mercadopago`, baseUrl), 303)
  }
}
