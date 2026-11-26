import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClientShell } from "@/components/client-shell";
import { KeyIcon, CardIcon, BoltIcon } from "@/components/ui-icons";

export default async function DashboardPage() {
  const user = await requireUser();

  const [licenses, payments, active] = await Promise.all([
    prisma.license.count({ where: { userId: user.id } }),
    prisma.payment.count({ where: { userId: user.id } }),
    prisma.license.count({ where: { userId: user.id, status: "ACTIVE" } }),
  ]);

  return (
    <ClientShell title="Visão geral" subtitle="Tudo da sua conta VKS BOOST em um só lugar.">
      <div className="stats-grid-4 compact px-stats-3">
        <div className="metric-neo">
          <div className="metric-label-neo">Keys</div>
          <div className="metric-value-neo">{licenses}</div>
          <div className="metric-sub-neo">{active} ativa{active === 1 ? "" : "s"}</div>
        </div>
        <div className="metric-neo">
          <div className="metric-label-neo">Compras</div>
          <div className="metric-value-neo">{payments}</div>
          <div className="metric-sub-neo">Histórico completo</div>
        </div>
        <div className="metric-neo px-metric-cta">
          <div className="metric-label-neo">App</div>
          <div className="metric-value-neo">v2.0</div>
          <Link className="primary-button" href="/dashboard/downloads">Baixar agora</Link>
        </div>
      </div>

      <div className="px-quick">
        <Link href="/dashboard/licenses" className="px-quick-card"><KeyIcon /><strong>Minhas keys</strong><span>Veja status, validade e o PC vinculado.</span></Link>
        <Link href="/dashboard/purchases" className="px-quick-card"><CardIcon /><strong>Compras</strong><span>Pagamentos e comprovantes.</span></Link>
        <Link href="/dashboard/downloads" className="px-quick-card"><BoltIcon /><strong>Download</strong><span>Instalador oficial do VKS BOOST.</span></Link>
      </div>
    </ClientShell>
  );
}
