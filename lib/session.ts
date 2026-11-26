import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export type JwtUser = { id: string; email: string; name?: string; role: string }

let warned = false
/** Chave que assina os logins. Na Vercel PRECISA existir JWT_SECRET (ou NEXTAUTH_SECRET). */
export function secret() {
  const value = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
  if (value) return value
  if (process.env.NODE_ENV === 'production' && !warned) {
    warned = true
    console.error('SEGURANCA: JWT_SECRET não configurado na Vercel. Configure uma chave longa e secreta.')
  }
  return 'vksboostsupersecret'
}

export const SESSION_COOKIE = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
}

export function verifyToken(token?: string | null): JwtUser | null {
  if (!token) return null
  try {
    return jwt.verify(token, secret()) as JwtUser
  } catch {
    return null
  }
}

/** Usuário do cookie (sem consultar o banco) — para mostrar "Perfil" no topo etc. */
export async function getSession() {
  return verifyToken((await cookies()).get('vks_token')?.value)
}

/** Usuário do cookie confirmado no banco: precisa existir, estar ativo e ter um dos papéis. */
export async function getUserWithRole(roles: string[]) {
  const session = await getSession()
  if (!session?.id) return null
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, role: true, status: true },
  })
  if (!user || user.status !== 'ACTIVE' || !roles.includes(user.role)) return null
  return user
}

/** Use no começo de toda rota /api/admin: devolve a resposta de erro, ou null se for admin. */
export async function denyIfNotAdmin() {
  const admin = await getUserWithRole(['ADMIN'])
  if (!admin) return NextResponse.json({ ok: false, message: 'Acesso restrito ao admin.' }, { status: 401 })
  return null
}
