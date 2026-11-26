"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type LinkItem = { href: string; label: string; icon: ReactNode };

export function AdminSidebar({
  title,
  subtitle,
  links,
}: {
  title: string;
  subtitle: string;
  links: LinkItem[];
}) {
  const pathname = usePathname();

  return (
    <aside className="dashboard-sidebar px-side">
      <Link href="/" className="px-brand" aria-label="VKS BOOST">
        <svg width="58" height="28" viewBox="0 -6 122 58" aria-hidden="true">
          <g fill="none" stroke="#F5F5F5" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6,14 L18,46 L30,14" />
            <path d="M48,0 V46" />
            <path d="M68,14 L52,31 L68,46" />
            <path d="M102.9,18 A8,8 0 1 0 96,30 A8,8 0 1 1 89.1,42" />
          </g>
          <circle cx="114.5" cy="45.5" r="6" fill="#E10600" />
        </svg>
        <span className="px-brand-sub">BOOST</span>
      </Link>

      <div className="px-panel-name">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>

      <nav className="px-nav">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`px-link ${active ? "is-active" : ""}`}>
              <span className="px-link-icon">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-status">
        <span className="px-status-dot" />
        <div>
          <strong>Sistema online</strong>
          <span>Licenças e pagamentos ativos</span>
        </div>
      </div>
    </aside>
  );
}
