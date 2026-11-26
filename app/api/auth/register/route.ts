import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { secret, SESSION_COOKIE } from '@/lib/session'
import { allow, clientIp, tooMany } from '@/lib/rate-limit'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: Request) {
  try {
    // No máximo 5 contas novas por IP por hora (evita robô criando contas)
    if (!allow(`register:${clientIp(req)}`, 5, 60 * 60_000)) return tooMany('Muitas contas criadas desta rede. Tente mais tarde.')

    const body = await req.json().catch(() => ({}))
    const name = String(body?.name || '').trim().slice(0, 80)
    const email = String(body?.email || '').toLowerCase().trim().slice(0, 200)
    const password = String(body?.password || '')
    if (!name || !email || !password) return NextResponse.json({ ok: false, message: 'Preencha nome, email e senha.' }, { status: 400 })
    if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, message: 'Digite um email válido.' }, { status: 400 })
    if (password.length < 8 || password.length > 200) return NextResponse.json({ ok: false, message: 'A senha precisa ter pelo menos 8 caracteres.' }, { status: 400 })

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return NextResponse.json({ ok: false, message: 'Esse email já está cadastrado.' }, { status: 409 })

    const passwordHash = await bcrypt.hash(password, 10)
    // Conta nova é SEMPRE cliente — ninguém vira admin ou revendedor pelo cadastro
    const user = await prisma.user.create({ data: { name, email, passwordHash, role: 'CUSTOMER', status: 'ACTIVE' } })
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, secret(), { expiresIn: '7d' })
    const response = NextResponse.json({ ok: true, redirectTo: '/cliente', user: { name: user.name, email: user.email, role: user.role } })
    response.cookies.set('vks_token', token, SESSION_COOKIE)
    return response
  } catch {
    return NextResponse.json({ ok: false, message: 'Erro interno ao criar conta.' }, { status: 500 })
  }
}
