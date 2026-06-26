import { handleAppLogin } from '@/lib/app-license-auth'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  return handleAppLogin(req, 'PRECISSION_FIX')
}
