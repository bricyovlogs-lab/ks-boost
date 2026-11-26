import { redirect } from 'next/navigation'
import { Sidebar } from '../../components/Sidebar'
import { getUserWithRole } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getUserWithRole(['ADMIN'])
  if (!admin) redirect('/login?next=/admin')

  return (
    <div className="px-admin">
      <Sidebar email={admin.email} />
      <main className="px-admin-main">{children}</main>
    </div>
  )
}
