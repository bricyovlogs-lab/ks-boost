import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  HomeIcon,
  UsersIcon,
  KeyIcon,
  CardIcon,
  TicketIcon,
  ChartIcon,
  MoneyIcon,
  SearchIcon,
} from "@/components/ui-icons";

export default async function AdminCouponsPage() {
  await requireAdmin();
  const coupons = await prisma.coupon.findMany({
    include: {
      affiliateProfile: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  });

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
          <section className="premium-admin-shell v7">
            <div className="premium-admin-top">
              <div className="premium-admin-title">
                <h1>Gestão de cupons</h1>
                <p>Crie descontos por percentual ou valor fixo, vincule parceiros e gerencie campanhas de venda.</p>
              </div>

              <div className="status-chip large">
                <div className="status-chip-head">
                  <span>Coupons Engine</span>
                  <span className="status-dot-red" />
                </div>
                <div className="muted">Sistema preparado para produção, descontos e comissões por parceiro.</div>
              </div>
            </div>

            <div className="premium-grid-coupons-v10">
              <div className="premium-panel coupon-create-panel-v10">
                <div className="panel-head-neo">
                  <div className="panel-title-neo">
                    <span><TicketIcon /></span>
                    <span>Criar cupom</span>
                  </div>
                  <span className="panel-accent">Create</span>
                </div>

                <form className="form" action="/api/admin/coupons" method="post">
                  <div className="coupon-form-grid-v10">
                    <div className="field">
                      <label>Código</label>
                      <input className="input" name="code" type="text" placeholder="Ex: VKS10" required />
                    </div>
                    <div className="field">
                      <label>Rótulo</label>
                      <input className="input" name="label" type="text" placeholder="Cupom lançamento" />
                    </div>
                    <div className="field">
                      <label>Tipo de desconto</label>
                      <select className="input" name="discountType" defaultValue="PERCENT">
                        <option value="PERCENT">Percentual</option>
                        <option value="FIXED">Valor fixo</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Valor do desconto</label>
                      <input className="input" name="discountValue" type="number" step="0.01" placeholder="10" required />
                    </div>
                    <div className="field">
                      <label>Email do parceiro</label>
                      <input className="input" name="affiliateEmail" type="email" placeholder="influencer@vksboost.com" />
                    </div>
                    <div className="field">
                      <label>Máximo de usos</label>
                      <input className="input" name="maxUses" type="number" placeholder="Opcional" />
                    </div>
                  </div>

                  <div className="coupon-helper-grid-v10">
                    <div className="helper-card-v10">
                      <strong>Percentual</strong>
                      <span className="muted">Use para campanhas tipo 10% OFF, 15% OFF e cupons de creator.</span>
                    </div>
                    <div className="helper-card-v10">
                      <strong>Valor fixo</strong>
                      <span className="muted">Bom para ações rápidas com abatimento fixo sobre o pedido.</span>
                    </div>
                  </div>

                  <button className="primary-button coupon-submit-v10" type="submit">Criar cupom</button>
                </form>
              </div>

              <div className="premium-panel">
                <div className="panel-head-neo">
                  <div className="panel-title-neo">
                    <span><SearchIcon /></span>
                    <span>Pesquisar cupons</span>
                  </div>
                  <span className="panel-accent">Search</span>
                </div>

                <div className="search-bar-neo">
                  <div className="search-inline">
                    <span className="search-inline-icon"><SearchIcon /></span>
                    <input className="input" placeholder="Código ou rótulo..." />
                  </div>
                  <button className="primary-button" type="button">Buscar</button>
                </div>

                <div className="real-table-wrap">
                  <table className="real-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Desconto</th>
                        <th>Dono</th>
                        <th>Status</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((coupon) => (
                        <tr key={coupon.id}>
                          <td>{coupon.code}</td>
                          <td>{coupon.discountType === "PERCENT" ? `${coupon.discountValue}%` : `R$ ${coupon.discountValue}`}</td>
                          <td>{coupon.affiliateProfile?.user.email || "-"}</td>
                          <td>{coupon.isActive ? `Ativo • ${coupon.usedCount}${coupon.maxUses ? `/${coupon.maxUses}` : ""}` : "Inativo"}</td>
                          <td>
                            <span className={`pill-chip ${coupon.isActive ? "red" : ""}`}>
                              {coupon.isActive ? "Ativo" : "Pendente"}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {!coupons.length ? (
                        <tr>
                          <td colSpan={5}>Nenhum cupom encontrado.</td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="premium-panel premium-table-card">
              <div className="panel-head-neo">
                <div className="panel-title-neo">
                  <span><ChartIcon /></span>
                  <span>Checklist de deploy</span>
                </div>
                <span className="panel-accent">Production</span>
              </div>

              <div className="deploy-check-grid-v10">
                <div className="quick-link-card">
                  <div>1</div>
                  <h3>Banco e Prisma</h3>
                  <p>Configurar PostgreSQL externo, migrations e variáveis de ambiente corretas.</p>
                </div>
                <div className="quick-link-card">
                  <div>2</div>
                  <h3>Stripe</h3>
                  <p>Conectar products, webhooks e price IDs de produção.</p>
                </div>
                <div className="quick-link-card">
                  <div>3</div>
                  <h3>Email</h3>
                  <p>Definir remetente, domínio e entrega automática da key.</p>
                </div>
                <div className="quick-link-card">
                  <div>4</div>
                  <h3>Deploy</h3>
                  <p>Publicar na Vercel, validar rotas protegidas e testar fluxo completo.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
