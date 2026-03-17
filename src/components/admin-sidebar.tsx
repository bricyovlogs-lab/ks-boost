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
    <aside className="dashboard-sidebar">
      <div className="dashboard-brand-card">
        <div className="dashboard-brand-mark">VKS</div>
        <div>
          <div className="dashboard-brand-title">{title}</div>
          <div className="dashboard-brand-subtitle">{subtitle}</div>
        </div>
      </div>

      <div className="dashboard-nav-section">NAVEGAÇÃO</div>

      <nav className="dashboard-nav">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`dashboard-nav-link ${active ? "active" : ""}`}>
              <span className="dashboard-nav-icon">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="dashboard-side-card">
        <div className="dashboard-side-card-title">VKS BOOST</div>
        <p className="dashboard-side-card-text">
          Painel premium com foco em licenciamento, cupons, parceiros e performance.
        </p>
        <div className="dashboard-side-badge">produção funcional</div>
      </div>
    </aside>
  );
}
