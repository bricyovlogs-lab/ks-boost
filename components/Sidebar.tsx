'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const I = {
  home: 'M3 10.5 12 3l9 7.5M5 9.8V21h14V9.8',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  key: 'M7.5 21a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11M21 2l-9.6 9.6M15 5h4v4',
  card: 'M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM2 10h20',
  ticket: 'M3 9a3 3 0 1 0 0 6v3h18v-3a3 3 0 1 0 0-6V6H3zM13 6v12',
  money: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18',
  out: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
}

function Icon({ d }: { d: string }) {
  return <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
}

const MENUS = {
  admin: {
    title: 'Admin',
    subtitle: 'Controle total VKS',
    items: [
      { name: 'Dashboard', path: '/admin', icon: I.home },
      { name: 'Usuários', path: '/admin/usuarios', icon: I.users },
      { name: 'Licenças', path: '/admin/keys', icon: I.key },
      { name: 'Pagamentos', path: '/admin/pagamentos', icon: I.card },
      { name: 'Cupons', path: '/admin/cupons', icon: I.ticket },
      { name: 'Saques', path: '/admin/saques', icon: I.money },
      { name: 'Ver site', path: '/', icon: I.globe },
    ],
  },
  reseller: {
    title: 'Parceiro',
    subtitle: 'Revendedor / criador',
    items: [
      { name: 'Painel', path: '/revendedor', icon: I.home },
      { name: 'Minhas keys', path: '/cliente', icon: I.key },
      { name: 'Ver site', path: '/', icon: I.globe },
    ],
  },
} as const

export function Sidebar({ email, variant = 'admin' }: { email?: string; variant?: keyof typeof MENUS }) {
  const pathname = usePathname()
  const menu = MENUS[variant]

  return (
    <aside className="px-side">
      <Link href="/" className="px-brand" aria-label="VKS BOOST">
        <svg width="58" height="28" viewBox="0 -6 122 58" aria-hidden="true">
          <g fill="none" stroke="#F5F5F5" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6,14 L18,46 L30,14" /><path d="M48,0 V46" /><path d="M68,14 L52,31 L68,46" />
            <path d="M102.9,18 A8,8 0 1 0 96,30 A8,8 0 1 1 89.1,42" />
          </g>
          <circle cx="114.5" cy="45.5" r="6" fill="#E10600" />
        </svg>
        <span className="px-brand-sub">BOOST</span>
      </Link>

      <div className="px-panel-name">
        <strong>{menu.title}</strong>
        <span>{email || menu.subtitle}</span>
      </div>

      <nav className="px-nav">
        {menu.items.map((item) => {
          const active = item.path === '/' ? false : pathname === item.path
          return (
            <Link key={item.path + item.name} href={item.path} className={`px-link ${active ? 'is-active' : ''}`}>
              <span className="px-link-icon"><Icon d={item.icon} /></span>
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-side-foot">
        <div className="px-status">
          <span className="px-status-dot" />
          <div><strong>Sistema online</strong><span>Pagamentos e keys ativos</span></div>
        </div>
        <form action="/api/auth/logout" method="post">
          <button className="px-logout" type="submit"><Icon d={I.out} /> Sair da conta</button>
        </form>
      </div>
    </aside>
  )
}
