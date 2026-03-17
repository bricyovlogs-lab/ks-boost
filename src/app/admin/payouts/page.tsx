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
} from "@/components/ui-icons";
import { formatBRL } from "@/lib/utils";

export default async function AdminPayoutsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const params = (await searchParams) || {};
  const status = params.status || "";

  const payoutRequests = await prisma.payoutRequest.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      affiliateProfile: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { requestedAt: "desc" },
    take: 100,
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
                <h1>Solicitações de saque</h1>
                <p>Aprove, rejeite e marque como pago os saques de influencer e revendedor.</p>
              </div>

              <div className="status-chip large">
                <div className="status-chip-head">
                  <span>Payout Status</span>
                  <span className="status-dot-red" />
                </div>
                <div className="muted">Fluxo financeiro de parceiros centralizado para produção real.</div>
              </div>
            </div>

            <div className="premium-panel">
              <div className="panel-head-neo">
                <div className="panel-title-neo">
                  <span><MoneyIcon /></span>
                  <span>Filtro de status</span>
                </div>
                <span className="panel-accent">Filter</span>
              </div>

              <div className="search-bar-neo">
                <a href="/admin/payouts" className={`pill-chip ${status === "" ? "red" : ""}`}>Todos</a>
                <a href="/admin/payouts?status=PENDING" className={`pill-chip ${status === "PENDING" ? "red" : ""}`}>Pendentes</a>
                <a href="/admin/payouts?status=APPROVED" className={`pill-chip ${status === "APPROVED" ? "red" : ""}`}>Aprovados</a>
                <a href="/admin/payouts?status=PAID" className={`pill-chip ${status === "PAID" ? "red" : ""}`}>Pagos</a>
                <a href="/admin/payouts?status=REJECTED" className={`pill-chip ${status === "REJECTED" ? "red" : ""}`}>Rejeitados</a>
              </div>

              <div className="real-table-wrap">
                <table className="real-table">
                  <thead>
                    <tr>
                      <th>Parceiro</th>
                      <th>Valor</th>
                      <th>Status</th>
                      <th>PIX</th>
                      <th>Data</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutRequests.map((request) => (
                      <tr key={request.id}>
                        <td>
                          <div>{request.affiliateProfile.user.email}</div>
                          <div className="muted">{request.pixName}</div>
                        </td>
                        <td>{formatBRL(request.amountCents)}</td>
                        <td>{request.status}</td>
                        <td>{request.pixKey}</td>
                        <td>{new Date(request.requestedAt).toLocaleDateString("pt-BR")}</td>
                        <td>
                          <div className="payout-actions-v12">
                            {request.status === "PENDING" ? (
                              <>
                                <form action={`/api/admin/payouts/${request.id}`} method="post">
                                  <input type="hidden" name="actionType" value="approve" />
                                  <button className="pill-chip red" type="submit">Aprovar</button>
                                </form>
                                <form action={`/api/admin/payouts/${request.id}`} method="post">
                                  <input type="hidden" name="actionType" value="reject" />
                                  <button className="pill-chip" type="submit">Rejeitar</button>
                                </form>
                              </>
                            ) : null}

                            {request.status === "APPROVED" ? (
                              <form action={`/api/admin/payouts/${request.id}`} method="post">
                                <input type="hidden" name="actionType" value="mark_paid" />
                                <button className="pill-chip red" type="submit">Marcar pago</button>
                              </form>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!payoutRequests.length ? (
                      <tr>
                        <td colSpan={6}>Nenhuma solicitação encontrada.</td>
                      </tr>
                    ) : null}
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
