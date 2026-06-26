import { NextResponse } from 'next/server'

function clearAndRedirect() {
  const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
  response.cookies.set('vks_token', '', { path: '/', maxAge: 0 })
  return response
}

export async function GET() {
  return clearAndRedirect()
}

export async function POST() {
  return clearAndRedirect()
}
