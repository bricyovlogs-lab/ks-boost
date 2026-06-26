import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const TOKEN_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'vksboostsupersecret'

export const dynamic = 'force-dynamic'

export type ProductTypeName = 'OPTIMIZER' | 'PRECISSION_FIX' | 'CROSSHAIR'

export function normalizeProductType(value: unknown): ProductTypeName | null {
  const raw = String(value || '').trim().toUpperCase().replace(/\s+/g, '_').replace(/-/g, '_')

  if (raw === 'OPTIMIZER' || raw === 'VKS_BOOST_OPTIMIZER' || raw === 'BOOST_OPTIMIZER') return 'OPTIMIZER'
  if (raw === 'PRECISSION_FIX' || raw === 'PRECISION_FIX' || raw === 'VKS_PRECISSION_FIX' || raw === 'VKS_PRECISION_FIX') return 'PRECISSION_FIX'
  if (raw === 'CROSSHAIR' || raw === 'VKS_CROSSHAIR') return 'CROSSHAIR'

  return null
}

export function licenseResponse(payload: Record<string, any>, status = 200) {
  return NextResponse.json(payload, { status })
}

export async function handleAppLogin(req: Request, forcedProductType?: ProductTypeName) {
  try {
    const body = await req.json()
    const email = String(body.email || '').toLowerCase().trim()
    const password = String(body.password || '')
    const deviceId = String(body.device_id || body.deviceId || body.hwid || '').trim()
    const requestedProduct = forcedProductType || normalizeProductType(body.product_type || body.productType)

    if (!email || !password || !deviceId || !requestedProduct) {
      return licenseResponse(
        {
          success: false,
          ok: false,
          valid: false,
          can_open_app: false,
          canOpen: false,
          message: 'Email, senha, produto e device_id são obrigatórios.',
        },
        400,
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        licenses: {
          include: { product: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) {
      return licenseResponse(
        {
          success: false,
          ok: false,
          valid: false,
          can_open_app: false,
          canOpen: false,
          message: 'Conta não encontrada.',
        },
        401,
      )
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash)
    if (!passwordOk) {
      return licenseResponse(
        {
          success: false,
          ok: false,
          valid: false,
          can_open_app: false,
          canOpen: false,
          message: 'Email ou senha incorretos.',
        },
        401,
      )
    }

    if (user.status !== 'ACTIVE') {
      return licenseResponse(
        {
          success: false,
          ok: false,
          valid: false,
          can_open_app: false,
          canOpen: false,
          message: 'Conta bloqueada ou inativa.',
        },
        403,
      )
    }

    const activeLicense = user.licenses.find((license) => {
      const sameProduct = license.product?.type === requestedProduct
      const active = license.status === 'ACTIVE'
      const notExpired = !license.expiresAt || new Date(license.expiresAt).getTime() > Date.now()
      return sameProduct && active && notExpired
    })

    if (!activeLicense) {
      return licenseResponse(
        {
          success: false,
          ok: false,
          valid: false,
          can_open_app: false,
          canOpen: false,
          product_type: requestedProduct,
          message: `Você não possui uma key ativa do ${requestedProduct}.`,
        },
        403,
      )
    }

    if (activeLicense.deviceId && activeLicense.deviceId !== deviceId) {
      return licenseResponse(
        {
          success: false,
          ok: false,
          valid: false,
          can_open_app: false,
          canOpen: false,
          message: 'Esta key já está vinculada a outro computador.',
          reason: 'HWID_DIFERENTE',
        },
        403,
      )
    }

    const license = activeLicense.deviceId
      ? activeLicense
      : await prisma.license.update({
          where: { id: activeLicense.id },
          data: { deviceId },
          include: { product: true, user: true },
        })

    const token = jwt.sign(
      {
        userId: user.id,
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        product_type: requestedProduct,
        licenseId: license.id,
        key: license.code,
        device_id: deviceId,
      },
      TOKEN_SECRET,
      { expiresIn: '7d' },
    )

    return licenseResponse({
      success: true,
      ok: true,
      valid: true,
      can_open_app: true,
      canOpen: true,
      message: 'Login autorizado.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      license: {
        id: license.id,
        key: license.code,
        code: license.code,
        product_type: license.product?.type,
        productType: license.product?.type,
        status: license.status,
        lifetime: license.lifetime,
        expiresAt: license.expiresAt,
        device_id: license.deviceId || deviceId,
        deviceId: license.deviceId || deviceId,
      },
    })
  } catch (error) {
    console.error('APP_LOGIN_ERROR', error)
    return licenseResponse(
      {
        success: false,
        ok: false,
        valid: false,
        can_open_app: false,
        canOpen: false,
        message: 'Erro interno ao validar login do aplicativo.',
      },
      500,
    )
  }
}

export async function handleLicenseCheck(input: {
  token?: string
  email?: string
  key?: string
  product_type?: string
  productType?: string
  device_id?: string
  deviceId?: string
  hwid?: string
}) {
  try {
    const key = String(input.key || '').trim()
    const email = input.email ? String(input.email).toLowerCase().trim() : ''
    const deviceId = String(input.device_id || input.deviceId || input.hwid || '').trim()
    const productType = normalizeProductType(input.product_type || input.productType)

    if (!key || !deviceId || !productType) {
      return licenseResponse(
        {
          success: false,
          ok: false,
          valid: false,
          can_open_app: false,
          canOpen: false,
          message: 'Key, produto e device_id são obrigatórios.',
        },
        400,
      )
    }

    if (input.token) {
      try {
        jwt.verify(input.token, TOKEN_SECRET)
      } catch {
        return licenseResponse(
          {
            success: false,
            ok: false,
            valid: false,
            can_open_app: false,
            canOpen: false,
            message: 'Sessão inválida ou expirada.',
          },
          401,
        )
      }
    }

    const license = await prisma.license.findUnique({
      where: { code: key },
      include: { user: true, product: true },
    })

    if (!license) {
      return licenseResponse(
        {
          success: false,
          ok: false,
          valid: false,
          can_open_app: false,
          canOpen: false,
          message: 'Key não encontrada.',
          reason: 'KEY_NAO_ENCONTRADA',
        },
        404,
      )
    }

    if (email && license.user.email !== email) {
      return licenseResponse(
        {
          success: false,
          ok: false,
          valid: false,
          can_open_app: false,
          canOpen: false,
          message: 'Esta key não pertence a esta conta.',
          reason: 'EMAIL_DIFERENTE',
        },
        403,
      )
    }

    if (license.user.status !== 'ACTIVE') {
      return licenseResponse(
        {
          success: false,
          ok: false,
          valid: false,
          can_open_app: false,
          canOpen: false,
          message: 'Conta bloqueada ou inativa.',
          reason: 'CONTA_INATIVA',
        },
        403,
      )
    }

    if (license.status !== 'ACTIVE') {
      return licenseResponse(
        {
          success: false,
          ok: false,
          valid: false,
          can_open_app: false,
          canOpen: false,
          status: license.status,
          message: 'Key bloqueada ou expirada.',
          reason: 'KEY_INATIVA',
        },
        403,
      )
    }

    if (license.product?.type !== productType) {
      return licenseResponse(
        {
          success: false,
          ok: false,
          valid: false,
          can_open_app: false,
          canOpen: false,
          message: 'Esta key pertence a outro produto.',
          reason: 'PRODUTO_DIFERENTE',
        },
        403,
      )
    }

    if (license.expiresAt && new Date(license.expiresAt).getTime() < Date.now()) {
      return licenseResponse(
        {
          success: false,
          ok: false,
          valid: false,
          can_open_app: false,
          canOpen: false,
          message: 'Sua licença expirou.',
          reason: 'KEY_EXPIRADA',
        },
        403,
      )
    }

    if (license.deviceId && license.deviceId !== deviceId) {
      return licenseResponse(
        {
          success: false,
          ok: false,
          valid: false,
          can_open_app: false,
          canOpen: false,
          message: 'Esta key está vinculada a outro computador.',
          reason: 'HWID_DIFERENTE',
        },
        403,
      )
    }

    const updatedLicense = license.deviceId
      ? license
      : await prisma.license.update({
          where: { id: license.id },
          data: { deviceId },
          include: { user: true, product: true },
        })

    return licenseResponse({
      success: true,
      ok: true,
      valid: true,
      can_open_app: true,
      canOpen: true,
      message: 'Licença válida.',
      product: updatedLicense.product.type,
      product_type: updatedLicense.product.type,
      productType: updatedLicense.product.type,
      licenseType: updatedLicense.lifetime ? 'LIFETIME' : 'TEMPORARY',
      accountStatus: updatedLicense.user.status,
      status: updatedLicense.status,
      license: {
        id: updatedLicense.id,
        key: updatedLicense.code,
        code: updatedLicense.code,
        product_type: updatedLicense.product.type,
        productType: updatedLicense.product.type,
        status: updatedLicense.status,
        lifetime: updatedLicense.lifetime,
        expiresAt: updatedLicense.expiresAt,
        device_id: updatedLicense.deviceId,
        deviceId: updatedLicense.deviceId,
      },
    })
  } catch (error) {
    console.error('LICENSE_CHECK_ERROR', error)
    return licenseResponse(
      {
        success: false,
        ok: false,
        valid: false,
        can_open_app: false,
        canOpen: false,
        message: 'Erro interno ao verificar licença.',
      },
      500,
    )
  }
}
