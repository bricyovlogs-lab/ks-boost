import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await requireUser();

  const [licenses, payments] = await Promise.all([
    prisma.license.count({ where: { userId: user.id } }),
    prisma.payment.count({ where: { userId: user.id } }),
  ]);

  return (
    <section className="panel">
      <div className="container">
        <div className="grid-3">
          <div className="card"><div className="muted">Licenças</div><div className="kpi">{licenses}</div></div>
          <div className="card"><div className="muted">Compras</div><div className="kpi">{payments}</div></div>
          <div className="card">
            <div className="muted">Ações rápidas</div>
            <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
              <Link className="secondary-button" href="/dashboard/licenses">Ver keys</Link>
              <Link className="secondary-button" href="/dashboard/purchases">Ver compras</Link>
              <Link className="secondary-button" href="/dashboard/downloads">Baixar app</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
