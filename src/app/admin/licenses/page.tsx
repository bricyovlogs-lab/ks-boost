import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { maskKey } from "@/lib/utils";
import { AdminSidebar } from "@/components/admin-sidebar";
import { HomeIcon, UsersIcon, KeyIcon, CardIcon, TicketIcon, ChartIcon, SearchIcon } from "@/components/ui-icons";

export default async function AdminLicensesPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = params?.q?.trim() || "";
  const status = params?.status?.trim() || "";

  const licenses = await prisma.license.findMany({
    where: {
      ...(q ? {
        OR: [
          { buyerEmail: { contains: q, mode: "insensitive" } },
          { key: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
      ...(status ? { status: status as any } : {}),
    },
    include: { user: true },
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
            <div className="premium-admin-top"><div className="premium-admin-title"><h1>Licenças</h1><p>Busca por email/key e ações de reset, bloqueio e desbloqueio.</p></div></div>
            <div className="premium-panel">
              <form className="search-bar-neo" method="get">
                <div className="search-inline"><span className="search-inline-icon"><SearchIcon /></span><input className="input" name="q" defaultValue={q} placeholder="Buscar por email ou key..." /></div>
                <select className="input" name="status" defaultValue={status}>
                  <option value="">Todos os status</option>
                  <option value="ACTIVE">Ativa</option>
                  <option value="EXPIRED">Expirada</option>
                  <option value="BLOCKED">Bloqueada</option>
                </select>
                <button className="primary-button" type="submit">Filtrar</button>
              </form>

              <div className="real-table-wrap">
                <table className="real-table">
                  <thead><tr><th>Email</th><th>Key</th><th>Status</th><th>Validade</th><th>HWID</th><th>Ações</th></tr></thead>
                  <tbody>
                    {licenses.map((license) => (
                      <tr key={license.id}>
                        <td>{license.user.email}</td>
                        <td>{maskKey(license.key)}</td>
                        <td>{license.status}</td>
                        <td>{license.expiresAt ? new Date(license.expiresAt).toLocaleString("pt-BR") : "Vitalícia"}</td>
                        <td>{license.hwid || "-"}</td>
                        <td>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <form action={`/api/admin/licenses/${license.id}`} method="post">
                              <input type="hidden" name="_method" value="PATCH" />
                              <input type="hidden" name="action" value="reset_hwid" />
                              <button className="secondary-button" type="submit">Resetar HWID</button>
                            </form>
                            <form action={`/api/admin/licenses/${license.id}`} method="post">
                              <input type="hidden" name="_method" value="PATCH" />
                              <input type="hidden" name="action" value={license.status === "BLOCKED" ? "unblock" : "block"} />
                              <button className="ghost-button" type="submit">{license.status === "BLOCKED" ? "Desbloquear" : "Bloquear"}</button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!licenses.length ? <tr><td colSpan={6}>Nenhuma licença encontrada.</td></tr> : null}
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
