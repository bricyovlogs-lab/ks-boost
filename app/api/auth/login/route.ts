import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { secret, SESSION_COOKIE } from '@/lib/session'
import { allow, clientIp, tooMany } from '@/lib/rate-limit'

// Hash falso: compara mesmo quando o email não existe, para não dar pista de quais emails têm conta
const DUMMY_HASH = '$2a$10$G8wRRg7n/.km8ZQKrVOgvel5PcxAiQHTmPR0H6cfZ7vfP2ZGHo8Ce'

export async function POST(req: Request) {
  try {
    const ip = clientIp(req)
    const body = await req.json().catch(() => ({}))
    const email = String(body?.email || '').toLowerCase().trim().slice(0, 200)
    const password = String(body?.password || '').slice(0, 200)
    if (!email || !password) return NextResponse.json({ ok: false, message: 'Preencha email e senha.' }, { status: 400 })

    // 10 tentativas por IP a cada 10 min, e 6 por conta a cada 15 min
    if (!allow(`login:ip:${ip}`, 10, 10 * 60_000) || !allow(`login:email:${email}`, 6, 15 * 60_000)) return tooMany()

    const user = await prisma.user.findUnique({ where: { email } })
    const validPassword = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH)
    if (!user || !validPassword) return NextResponse.json({ ok: false, message: 'Email ou senha inválidos.' }, { status: 401 })
    if (user.status !== 'ACTIVE') return NextResponse.json({ ok: false, message: 'Conta bloqueada ou inativa.' }, { status: 403 })

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, secret(), { expiresIn: '7d' })
    const redirectTo = user.role === 'ADMIN' ? '/admin' : user.role === 'RESELLER' ? '/revendedor' : '/cliente'
    const response = NextResponse.json({ ok: true, redirectTo, user: { name: user.name, email: user.email, role: user.role } })
    response.cookies.set('vks_token', token, SESSION_COOKIE)
    return response
  } catch {
    return NextResponse.json({ ok: false, message: 'Erro interno ao fazer login.' }, { status: 500 })
  }
}
