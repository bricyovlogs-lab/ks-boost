import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  HomeIcon, UsersIcon, KeyIcon, CardIcon, TicketIcon, ChartIcon,
  BoltIcon, MoneyIcon, SearchIcon, StatIcon,
} from "@/components/ui-icons";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [users, payments, licenses, coupons, recentPayments] = await Promise.all([
    prisma.user.count(),
    prisma.payment.count(),
    prisma.license.count(),
    prisma.coupon.count(),
    prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return (
    <section className="saas-shell">
      <div className="container saas-grid">
        <AdminSidebar
          title="Admin Control"
          subtitle="management suite"
          links={[
            { href: "/admin", label: "Dashboard", icon: <HomeIcon /> },
            { href: "/admin/users", label: "Usuários", icon: <UsersIcon /> },
            { href: "/admin/licenses", label: "Licenças", icon: <KeyIcon /> },
            { href: "/admin/payments", label: "Pagamentos", icon: <CardIcon /> },
            { href: "/admin/coupons", label: "Cupons", icon: <TicketIcon /> },
            { href: "/admin/payouts", label: "Saques", icon: <MoneyIcon /> },
            { href: "/admin/metrics", label: "Métricas", icon: <ChartIcon /> },
          ]}
        />
        <div className="dashboard-main-area">
          <section className="premium-admin-shell v9">
            <div className="premium-admin-top">
              <div className="premium-admin-title">
                <h1>Dashboard</h1>
                <p>Painel central com visão geral de usuários, vendas, cupons e ações rápidas.</p>
              </div>
              <div className="status-chip large">
                <div className="status-chip-head">
                  <span>System Status</span>
                  <span className="status-dot-red" />
                </div>
                <div className="muted">Operação online. Licenças, pagamentos e campanhas funcionando normalmente.</div>
              </div>
            </div>

            <div className="stats-grid-4 compact">
              {[
                ["Usuários", users, "Contas registradas", <UsersIcon key="u" />],
                ["Pedidos", payments, "Fluxo de pagamentos", <BoltIcon key="b" />],
                ["Licenças", licenses, "Keys geradas", <MoneyIcon key="m" />],
                ["Cupons", coupons, "Campanhas ativas", <TicketIcon key="t" />],
              ].map(([label, value, sub, icon]) => (
                <div className="metric-neo" key={String(label)}>
                  <div className="metric-icon-box"><StatIcon>{icon}</StatIcon></div>
                  <span className="metric-corner-dot" />
                  <div className="metric-label-neo">{label}</div>
                  <div className="metric-value-neo">{value}</div>
                  <div className="metric-sub-neo">{sub}</div>
                </div>
              ))}
            </div>

            <div className="premium-grid-3">
              <div className="premium-panel">
                <div className="panel-head-neo">
                  <div className="panel-title-neo"><ChartIcon /><span>Fluxo de vendas</span></div>
                  <span className="panel-accent">Weekly</span>
                </div>
                <div className="mini-chart">
                  <div className="chart-line-red" />
                  <div className="chart-line-red-2" style={{ top: "38%" }} />
                  <div className="chart-axis-labels">
                    <span>09 mar.</span><span>10 mar.</span><span>11 mar.</span><span>12 mar.</span><span>13 mar.</span><span>14 mar.</span><span>15 mar.</span>
                  </div>
                </div>
                <div className="chart-legend">
                  <span><span className="legend-dot red" /> Receita</span>
                  <span><span className="legend-dot soft" /> Tendência</span>
                </div>
              </div>

              <div className="premium-panel log-panel">
                <div className="panel-head-neo">
                  <div className="panel-title-neo"><BoltIcon /><span>Admin Logs</span></div>
                  <span className="panel-accent">Live</span>
                </div>
                <div className="pseudo-log-box">
                  <p>[16:04:11] Dashboard admin carregado.</p>
                  <p>[16:04:19] Painel de cupons disponível.</p>
                  <p>[16:04:23] Gestão de licenças habilitada.</p>
                  <p>[16:04:29] Monitoramento de parceiros ativo.</p>
                  <p>[16:04:37] Status operacional: online.</p>
                </div>
              </div>

              <div className="premium-panel">
                <div className="panel-head-neo">
                  <div className="panel-title-neo"><BoltIcon /><span>Ações rápidas</span></div>
                  <span className="panel-accent">Quick</span>
                </div>
                <div className="quick-links-neo" style={{ gridTemplateColumns: "1fr" }}>
                  <Link href="/admin/coupons" className="quick-link-card"><TicketIcon /><h3>Criar campanha</h3><p>Cadastre cupom e vincule parceiro.</p></Link>
                  <Link href="/admin/licenses" className="quick-link-card"><KeyIcon /><h3>Gerenciar keys</h3><p>Editar, resetar HWID e acompanhar status.</p></Link>
                  <Link href="/influencer" className="quick-link-card"><ChartIcon /><h3>Ver parceiros</h3><p>Acompanhe a experiência de influencer/revendedor.</p></Link>
                </div>
              </div>
            </div>

            <div className="premium-panel">
              <div className="panel-head-neo">
                <div className="panel-title-neo"><UsersIcon /><span>Últimos pagamentos</span></div>
                <span className="panel-accent">Recent</span>
              </div>
              <div className="search-bar-neo">
                <div className="search-inline">
                  <span className="search-inline-icon"><SearchIcon /></span>
                  <input className="input" placeholder="Buscar pagamento..." />
                </div>
                <span className="pill-chip">Admin</span>
                <span className="pill-chip red">Online</span>
              </div>
              <div className="real-table-wrap">
                <table className="real-table">
                  <thead><tr><th>Cliente</th><th>Plano</th><th>Status</th><th>Valor</th><th>Data</th></tr></thead>
                  <tbody>
                    {recentPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{payment.customerEmail}</td>
                        <td>{payment.plan}</td>
                        <td>{payment.status}</td>
                        <td>R$ {(payment.amount / 100).toFixed(2)}</td>
                        <td>{new Date(payment.createdAt).toLocaleDateString("pt-BR")}</td>
                      </tr>
                    ))}
                    {!recentPayments.length ? <tr><td colSpan={5}>Nenhum pagamento encontrado.</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
