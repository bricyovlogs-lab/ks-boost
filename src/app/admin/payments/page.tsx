import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/utils";
import { AdminSidebar } from "@/components/admin-sidebar";
import { HomeIcon, UsersIcon, KeyIcon, CardIcon, TicketIcon, ChartIcon, SearchIcon } from "@/components/ui-icons";

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = params?.q?.trim() || "";
  const status = params?.status?.trim() || "";

  const payments = await prisma.payment.findMany({
    where: {
      ...(q ? {
        OR: [
          { customerEmail: { contains: q, mode: "insensitive" } },
          { couponCode: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
      ...(status ? { status: status as any } : {}),
    },
    include: { user: true, coupon: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

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
            <div className="premium-admin-top"><div className="premium-admin-title"><h1>Pagamentos</h1><p>Busca por cliente/cupom e filtro por status.</p></div></div>
            <div className="premium-panel">
              <form className="search-bar-neo" method="get">
                <div className="search-inline"><span className="search-inline-icon"><SearchIcon /></span><input className="input" name="q" defaultValue={q} placeholder="Buscar por email ou cupom..." /></div>
                <select className="input" name="status" defaultValue={status}>
                  <option value="">Todos os status</option>
                  <option value="PENDING">Pendente</option>
                  <option value="PAID">Pago</option>
                  <option value="FAILED">Falhou</option>
                  <option value="REFUNDED">Reembolsado</option>
                </select>
                <button className="primary-button" type="submit">Filtrar</button>
              </form>

              <div className="real-table-wrap">
                <table className="real-table">
                  <thead><tr><th>Email</th><th>Plano</th><th>Valor</th><th>Status</th><th>Cupom</th><th>Data</th></tr></thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{payment.user.email}</td>
                        <td>{payment.plan}</td>
                        <td>{formatBRL(payment.amount)}</td>
                        <td>{payment.status}</td>
                        <td>{payment.couponCode || "-"}</td>
                        <td>{new Date(payment.createdAt).toLocaleString("pt-BR")}</td>
                      </tr>
                    ))}
                    {!payments.length ? <tr><td colSpan={6}>Nenhum pagamento encontrado.</td></tr> : null}
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
