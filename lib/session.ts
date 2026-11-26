import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export type JwtUser = { id: string; email: string; name?: string; role: string }

function secret() {
  return process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'vksboostsupersecret'
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
