import { NextResponse } from 'next/server'
import { getUserWithRole } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getUserWithRole(['ADMIN', 'RESELLER', 'CUSTOMER'])
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })
  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
}
