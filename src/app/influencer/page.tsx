import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/utils";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  HomeIcon,
  UsersIcon,
  CardIcon,
  TicketIcon,
  ChartIcon,
  MoneyIcon,
  SearchIcon,
  StatIcon,
} from "@/components/ui-icons";

export default async function InfluencerPage() {
  const user = await requireUser();

  const profile = await prisma.affiliateProfile.findUnique({
    where: { userId: user.id },
    include: {
      coupons: true,
      payments: {
        where: { status: "PAID" },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      payoutRequests: {
        orderBy: { requestedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!profile) {
    return (
      <section className="saas-shell">
        <div className="container">
          <div className="premium-panel">
            <h1 style={{ marginTop: 0 }}>Área de Influencer / Revendedor</h1>
            <p className="muted">Sua conta ainda não possui um perfil de parceiro vinculado.</p>
          </div>
        </div>
      </section>
    );
  }

  const traffic = profile.payments.length;
  const conversions = profile.payments.length;
  const avgSale = conversions > 0 ? Math.round(profile.totalRevenueCents / conversions) : 0;
  const availablePayout = Math.max(
    0,
    profile.totalCommissionCents - profile.paidOutCents - profile.pendingPayoutCents
  );

  return (
    <section className="saas-shell">
      <div className="container saas-grid">
        <AdminSidebar
          title="Partner Panel"
          subtitle="influencer / reseller"
          links={[
            { href: "/influencer", label: "Dashboard", icon: <HomeIcon /> },
            { href: "/dashboard", label: "Conta Cliente", icon: <UsersIcon /> },
            { href: "/influencer", label: "Cupons e vendas", icon: <TicketIcon /> },
            { href: "/dashboard", label: "Licenças", icon: <CardIcon /> },
          ]}
        />

        <div className="dashboard-main-area">
          <section className="premium-admin-shell v7">
            <div className="premium-admin-top">
              <div className="premium-admin-title">
                <h1>Dashboard Partner</h1>
                <p>Acompanhe vendas atribuídas, comissões, ticket médio e desempenho dos seus cupons.</p>
              </div>

              <div className="status-chip large">
                <div className="status-chip-head">
                  <span>Partner Status</span>
                  <span className="status-dot-red" />
                </div>
                <div className="muted">Perfil ativo. Comissão atual configurada em {profile.commissionPercent}%.</div>
              </div>
            </div>

            <div className="stats-grid-4 compact">
              <div className="metric-neo">
                <div className="metric-icon-box"><StatIcon><ChartIcon /></StatIcon></div>
                <span className="metric-corner-dot" />
                <div className="metric-label-neo">Tráfego</div>
                <div className="metric-value-neo">{traffic}</div>
                <div className="metric-sub-neo">Cliques / vendas atribuídas</div>
              </div>

              <div className="metric-neo">
                <div className="metric-icon-box"><StatIcon><UsersIcon /></StatIcon></div>
                <span className="metric-corner-dot" />
                <div className="metric-label-neo">Conversões</div>
                <div className="metric-value-neo">{conversions}</div>
                <div className="metric-sub-neo">Pedidos pagos no seu código</div>
              </div>

              <div className="metric-neo">
                <div className="metric-icon-box"><StatIcon><MoneyIcon /></StatIcon></div>
                <span className="metric-corner-dot" />
                <div className="metric-label-neo">Lucro total</div>
                <div className="metric-value-neo big-money">{formatBRL(profile.totalCommissionCents)}</div>
                <div className="metric-sub-neo">Comissão acumulada</div>
              </div>

              <div className="metric-neo">
                <div className="metric-icon-box"><StatIcon><CardIcon /></StatIcon></div>
                <span className="metric-corner-dot" />
                <div className="metric-label-neo">Saldo saque</div>
                <div className="metric-value-neo">{formatBRL(availablePayout)}</div>
                <div className="metric-sub-neo">Disponível para solicitar</div>
              </div>
            </div>

            <div className="premium-grid-3">
              <div className="premium-panel">
                <div className="panel-head-neo">
                  <div className="panel-title-neo">
                    <span><ChartIcon /></span>
                    <span>Fluxo de tráfego</span>
                  </div>
                  <span className="panel-accent">Weekly</span>
                </div>

                <div className="mini-chart">
                  <div className="chart-line-red" />
                  <div className="chart-line-red-2" style={{ top: "46%" }} />
                  <div className="chart-axis-labels">
                    <span>09 mar.</span>
                    <span>10 mar.</span>
                    <span>11 mar.</span>
                    <span>12 mar.</span>
                    <span>13 mar.</span>
                    <span>14 mar.</span>
                    <span>15 mar.</span>
                  </div>
                </div>
              </div>

              <div className="premium-panel">
                <div className="panel-head-neo">
                  <div className="panel-title-neo">
                    <span><MoneyIcon /></span>
                    <span>Volume de receita</span>
                  </div>
                  <span className="panel-accent">Finance</span>
                </div>

                <div className="mini-chart">
                  <div className="chart-line-red" style={{ top: "58%" }} />
                  <div className="chart-line-red-2" style={{ top: "34%" }} />
                  <div className="chart-axis-labels">
                    <span>09 mar.</span>
                    <span>10 mar.</span>
                    <span>11 mar.</span>
                    <span>12 mar.</span>
                    <span>13 mar.</span>
                    <span>14 mar.</span>
                    <span>15 mar.</span>
                  </div>
                </div>
              </div>

              <div className="premium-panel">
                <div className="panel-head-neo">
                  <div className="panel-title-neo">
                    <span><TicketIcon /></span>
                    <span>Quick Actions</span>
                  </div>
                  <span className="panel-accent">Partner</span>
                </div>

                <div className="quick-links-neo" style={{ gridTemplateColumns: "1fr" }}>
                  <div className="quick-link-card">
                    <TicketIcon />
                    <h3>Seu cupom</h3>
                    <p>Use seus códigos para acompanhar conversão e comissão.</p>
                  </div>
                  <div className="quick-link-card">
                    <ChartIcon />
                    <h3>Vendas</h3>
                    <p>Veja desempenho e volume gerado pelas campanhas.</p>
                  </div>
                  <div className="quick-link-card">
                    <MoneyIcon />
                    <h3>Saque</h3>
                    <p>Cadastre seu PIX e envie a solicitação pelo painel.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="premium-grid-2">
              <div className="premium-panel">
                <div className="panel-head-neo">
                  <div className="panel-title-neo">
                    <span><MoneyIcon /></span>
                    <span>Área de saque</span>
                  </div>
                  <span className="panel-accent">PIX</span>
                </div>

                <form className="form" action="/api/influencer/payout-request" method="post">
                  <div className="field">
                    <label>Nome para recebimento</label>
                    <input
                      className="input"
                      name="pixName"
                      type="text"
                      defaultValue={profile.payoutPixName || user.name || ""}
                      placeholder="Nome do recebedor"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Chave PIX</label>
                    <input
                      className="input"
                      name="pixKey"
                      type="text"
                      defaultValue={profile.payoutPixKey || ""}
                      placeholder="CPF, email, telefone ou chave aleatória"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Valor do saque em centavos</label>
                    <input
                      className="input"
                      name="amountCents"
                      type="number"
                      min="100"
                      defaultValue={availablePayout || 100}
                      required
                    />
                  </div>

                  <div className="helper-card-v10">
                    <strong>Saldo disponível: {formatBRL(availablePayout)}</strong>
                    <span className="muted">
                      O pedido será enviado para análise e também notificado no Discord da operação.
                    </span>
                  </div>

                  <button className="primary-button coupon-submit-v10" type="submit">
                    Solicitar saque
                  </button>
                </form>
              </div>

              <div className="premium-panel">
                <div className="panel-head-neo">
                  <div className="panel-title-neo">
                    <span><CardIcon /></span>
                    <span>Histórico de saques</span>
                  </div>
                  <span className="panel-accent">Payouts</span>
                </div>

                <div className="real-table-wrap">
                  <table className="real-table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>PIX</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.payoutRequests.map((request) => (
                        <tr key={request.id}>
                          <td>{new Date(request.requestedAt).toLocaleDateString("pt-BR")}</td>
                          <td>{formatBRL(request.amountCents)}</td>
                          <td>{request.status}</td>
                          <td>{request.pixKey}</td>
                        </tr>
                      ))}
                      {!profile.payoutRequests.length ? (
                        <tr><td colSpan={4}>Nenhum saque solicitado ainda.</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="premium-grid-2">
              <div className="premium-panel">
                <div className="panel-head-neo">
                  <div className="panel-title-neo">
                    <span><TicketIcon /></span>
                    <span>Seus cupons</span>
                  </div>
                  <span className="panel-accent">Codes</span>
                </div>

                <div className="real-table-wrap">
                  <table className="real-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Desconto</th>
                        <th>Usos</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.coupons.map((coupon) => (
                        <tr key={coupon.id}>
                          <td>{coupon.code}</td>
                          <td>{coupon.discountType === "PERCENT" ? `${coupon.discountValue}%` : formatBRL(Math.round(coupon.discountValue))}</td>
                          <td>{coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ""}</td>
                          <td>{coupon.isActive ? "Ativo" : "Inativo"}</td>
                        </tr>
                      ))}
                      {!profile.coupons.length ? (
                        <tr><td colSpan={4}>Nenhum cupom encontrado.</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="premium-panel">
                <div className="panel-head-neo">
                  <div className="panel-title-neo">
                    <span><CardIcon /></span>
                    <span>Últimas vendas</span>
                  </div>
                  <span className="panel-accent">Sales</span>
                </div>

                <div className="search-bar-neo">
                  <div className="search-inline">
                    <span className="search-inline-icon"><SearchIcon /></span>
                    <input className="input" placeholder="Buscar venda..." />
                  </div>
                  <span className="pill-chip red">Ativo</span>
                </div>

                <div className="real-table-wrap">
                  <table className="real-table">
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th>Plano</th>
                        <th>Venda</th>
                        <th>Comissão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.payments.map((payment) => (
                        <tr key={payment.id}>
                          <td>{payment.customerEmail}</td>
                          <td>{payment.plan}</td>
                          <td>{formatBRL(payment.amount)}</td>
                          <td>{formatBRL(payment.affiliateCommissionCents)}</td>
                        </tr>
                      ))}
                      {!profile.payments.length ? (
                        <tr><td colSpan={4}>Nenhuma venda encontrada.</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
