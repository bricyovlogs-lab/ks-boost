import { Sidebar } from '../../components/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-vks-dark text-white">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
