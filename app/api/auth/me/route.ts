import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('vks_token')?.value
  if (!token) return NextResponse.json({ ok: false }, { status: 401 })
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'vksboostsupersecret')
    return NextResponse.json({ ok: true, user })
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
}
