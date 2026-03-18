import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminUserManager, AddKeyButton } from "@/components/admin-user-manager";
import { HomeIcon, UsersIcon, KeyIcon, CardIcon, TicketIcon, ChartIcon, SearchIcon } from "@/components/ui-icons";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; role?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = params?.q?.trim() || "";
  const role = params?.role?.trim() || "";
  const users = await prisma.user.findMany({
    where: {
      ...(q ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] } : {}),
      ...(role ? { role: role as any } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      _count: { select: { licenses: true, payments: true } },
    },
  });

  const userRows = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    licensesCount: user._count.licenses,
  }));

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
            <div className="premium-admin-top" style={{ alignItems: "flex-start", gap: 14 }}>
              <div className="premium-admin-title">
                <h1>Usuários</h1>
                <p>Busca por email/nome e filtro por perfil.</p>
              </div>
              <AdminUserManager users={userRows} />
            </div>
            <div className="premium-panel">
              <form className="search-bar-neo" method="get">
                <div className="search-inline">
                  <span className="search-inline-icon"><SearchIcon /></span>
                  <input className="input" type="text" name="q" placeholder="Buscar usuário..." defaultValue={q} />
                </div>
                <select className="input" name="role" defaultValue={role}>
                  <option value="">Todos os perfis</option>
                  <option value="CUSTOMER">Cliente</option>
                  <option value="ADMIN">Admin</option>
                  <option value="AFFILIATE">Influencer</option>
                  <option value="RESELLER">Revendedor</option>
                </select>
                <button className="primary-button" type="submit">Filtrar</button>
              </form>

              <div className="real-table-wrap">
                <table className="real-table">
                  <thead><tr><th>Email</th><th>Nome</th><th>Perfil</th><th>Licenças</th><th>Pagamentos</th><th>Criado em</th><th>Ações</th></tr></thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>{user.name || "-"}</td>
                        <td>{user.role}</td>
                        <td>{user._count.licenses}</td>
                        <td>{user._count.payments}</td>
                        <td>{new Date(user.createdAt).toLocaleString("pt-BR")}</td>
                        <td><AddKeyButton user={{
                          id: user.id,
                          email: user.email,
                          name: user.name,
                          role: user.role,
                          licensesCount: user._count.licenses,
                        }} /></td>
                      </tr>
                    ))}
                    {!users.length ? <tr><td colSpan={7}>Nenhum usuário encontrado.</td></tr> : null}
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
