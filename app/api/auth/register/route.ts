import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../lib/prisma'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) return NextResponse.json({ ok: false, message: 'Preencha nome, email e senha.' }, { status: 400 })
    if (String(password).length < 6) return NextResponse.json({ ok: false, message: 'A senha precisa ter pelo menos 6 caracteres.' }, { status: 400 })
    const normalizedEmail = String(email).toLowerCase().trim()
    const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (exists) return NextResponse.json({ ok: false, message: 'Esse email já está cadastrado.' }, { status: 409 })
    const passwordHash = await bcrypt.hash(String(password), 10)
    const user = await prisma.user.create({ data: { name: String(name).trim(), email: normalizedEmail, passwordHash, role: 'CUSTOMER', status: 'ACTIVE' } })
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'vksboostsupersecret', { expiresIn: '7d' })
    const response = NextResponse.json({ ok: true, redirectTo: '/cliente', user: { name: user.name, email: user.email, role: user.role } })
    response.cookies.set('vks_token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 })
    return response
  } catch {
    return NextResponse.json({ ok: false, message: 'Erro interno ao criar conta.' }, { status: 500 })
  }
}
