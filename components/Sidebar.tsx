'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const items = [
  { name: 'Dashboard', path: '/admin', icon: '▣' },
  { name: 'Usuários', path: '/admin/usuarios', icon: '👤' },
  { name: 'Licenças', path: '/admin/keys', icon: '🔑' },
  { name: 'Pagamentos', path: '/admin/pagamentos', icon: '💳' },
  { name: 'Cupons', path: '/admin/cupons', icon: '🏷️' },
  { name: 'Saques', path: '/admin/saques', icon: '💸' },
  { name: 'Métricas', path: '/admin/metricas', icon: '📈' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function logout() {
    localStorage.removeItem('vksUser')
    localStorage.removeItem('vksToken')
    document.cookie = 'vks_token=; Max-Age=0; path=/'
    router.push('/')
  }

  return (
    <aside className="min-h-screen w-72 bg-black/80 border-r border-red-500/25 p-5 flex flex-col shadow-[18px_0_60px_rgba(255,23,68,.08)]">
      <Link href="/" className="flex items-center gap-3 mb-9 rounded-2xl border border-red-500/20 bg-red-950/20 p-3">
        <img src="/images/mascote-vks.png" className="h-12 w-12 object-contain" alt="VKS" />
        <div>
          <h2 className="text-2xl font-black text-red-500 leading-none">VKS BOOST</h2>
          <p className="text-[11px] text-zinc-400 mt-1">Admin premium</p>
        </div>
      </Link>

      <nav className="space-y-2 flex-1">
        {items.map((item) => {
          const active = pathname === item.path
          return (
            <Link
              key={item.name}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 border transition ${
                active
                  ? 'bg-red-500/15 border-red-500/60 text-white shadow-[0_0_25px_rgba(255,23,68,.20)]'
                  : 'border-transparent text-zinc-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-white'
              }`}
              href={item.path}
            >
              <span>{item.icon}</span>
              <span className="font-semibold">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <button
        onClick={logout}
        className="mt-6 w-full rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-left font-bold text-red-200 hover:bg-red-500 hover:text-white transition"
      >
        ⎋ Sair da conta
      </button>
    </aside>
  )
}
