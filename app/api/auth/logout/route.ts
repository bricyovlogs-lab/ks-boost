import { NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/session'

function clearAndRedirect(req: Request) {
  const response = NextResponse.redirect(new URL('/', req.url), 303)
  response.cookies.set('vks_token', '', { ...SESSION_COOKIE, maxAge: 0 })
  return response
}

export async function GET(req: Request) {
  return clearAndRedirect(req)
}

export async function POST(req: Request) {
  return clearAndRedirect(req)
}
