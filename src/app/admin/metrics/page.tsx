import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/utils";
import { AdminSidebar } from "@/components/admin-sidebar";
import { HomeIcon, UsersIcon, KeyIcon, CardIcon, TicketIcon, ChartIcon } from "@/components/ui-icons";

export default async function AdminMetricsPage() {
  await requireAdmin();
  const [paidCount, revenueAgg, activeLicenses, lifetimeLicenses, affiliates] = await Promise.all([
    prisma.payment.count({ where: { status: "PAID" } }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true, affiliateCommissionCents: true } }),
    prisma.license.count({ where: { status: "ACTIVE" } }),
    prisma.license.count({ where: { plan: "LIFETIME" } }),
    prisma.affiliateProfile.count(),
  ]);

  return (
    <section className="saas-shell">
      <div className="container saas-grid">
        <AdminSidebar title="Admin Control" subtitle="management suite" links={[
          { href: "/admin", label: "Dashboard", icon: <HomeIcon /> },
          { href: "/admin/users", label: "Usuários", icon: <UsersIcon /> },
          { href: "/admin/licenses", label: "Licenças", icon: <KeyIcon /> },
          { href: "/admin/payments", label: "Pagamentos", icon: <CardIcon /> },
          { href: "/admin/coupons", label: "Cupons", icon: <TicketIcon /> },
          { href: "/admin/metrics", label: "Métricas", icon: <ChartIcon /> },
        ]} />
        <div className="dashboard-main-area">
          <section className="premium-admin-shell v9">
            <div className="premium-admin-top"><div className="premium-admin-title"><h1>Métricas</h1><p>Visão consolidada de receita, licenças e parceiros.</p></div></div>
            <div className="stats-grid-4 compact">
              <div className="metric-neo"><div className="metric-label-neo">Pagamentos aprovados</div><div className="metric-value-neo">{paidCount}</div><div className="metric-sub-neo">Pedidos concluídos</div></div>
              <div className="metric-neo"><div className="metric-label-neo">Receita</div><div className="metric-value-neo" style={{ fontSize: 30 }}>{formatBRL(revenueAgg._sum.amount || 0)}</div><div className="metric-sub-neo">Total pago</div></div>
              <div className="metric-neo"><div className="metric-label-neo">Comissão parceiros</div><div className="metric-value-neo" style={{ fontSize: 30 }}>{formatBRL(revenueAgg._sum.affiliateCommissionCents || 0)}</div><div className="metric-sub-neo">Acumulado</div></div>
              <div className="metric-neo"><div className="metric-label-neo">Parceiros</div><div className="metric-value-neo">{affiliates}</div><div className="metric-sub-neo">Influencers / revendedores</div></div>
            </div>
            <div className="premium-grid-2">
              <div className="premium-panel"><h3>Licenças ativas</h3><div className="metric-value-neo">{activeLicenses}</div></div>
              <div className="premium-panel"><h3>Licenças vitalícias</h3><div className="metric-value-neo">{lifetimeLicenses}</div></div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
