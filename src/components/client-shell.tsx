import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { HomeIcon, KeyIcon, CardIcon, BoltIcon } from "@/components/ui-icons";

/** Moldura do painel do cliente (mesmo visual do admin) */
export function ClientShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="saas-shell">
      <div className="container saas-grid">
        <AdminSidebar
          title="Área do cliente"
          subtitle="Suas keys e compras"
          links={[
            { href: "/dashboard", label: "Visão geral", icon: <HomeIcon /> },
            { href: "/dashboard/licenses", label: "Minhas keys", icon: <KeyIcon /> },
            { href: "/dashboard/purchases", label: "Compras", icon: <CardIcon /> },
            { href: "/dashboard/downloads", label: "Download", icon: <BoltIcon /> },
          ]}
        />
        <div className="dashboard-main-area">
          <div className="premium-admin-top">
            <div className="premium-admin-title">
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativa", PENDING: "Pendente", INACTIVE: "Inativa", EXPIRED: "Expirada", BLOCKED: "Bloqueada",
  REFUNDED: "Reembolsada", CANCELLED: "Cancelada", PAID: "Pago", FAILED: "Falhou",
};

export function StatusPill({ status }: { status: string }) {
  const tone = status === "ACTIVE" || status === "PAID" ? "ok" : status === "PENDING" ? "wait" : "bad";
  return <span className={`px-pill px-pill--${tone}`}>{STATUS_LABEL[status] ?? status}</span>;
}
