import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../lib/prisma'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ ok: false, message: 'Preencha email e senha.' }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } })
    if (!user) return NextResponse.json({ ok: false, message: 'Email ou senha inválidos.' }, { status: 401 })
    const validPassword = await bcrypt.compare(String(password), user.passwordHash)
    if (!validPassword) return NextResponse.json({ ok: false, message: 'Email ou senha inválidos.' }, { status: 401 })
    if (user.status !== 'ACTIVE') return NextResponse.json({ ok: false, message: 'Conta bloqueada ou inativa.' }, { status: 403 })
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'vksboostsupersecret', { expiresIn: '7d' })
    const redirectTo = user.role === 'ADMIN' ? '/admin' : user.role === 'RESELLER' ? '/revendedor' : '/cliente'
    const response = NextResponse.json({ ok: true, redirectTo, user: { name: user.name, email: user.email, role: user.role } })
    response.cookies.set('vks_token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 })
    return response
  } catch {
    return NextResponse.json({ ok: false, message: 'Erro interno ao fazer login.' }, { status: 500 })
  }
}
