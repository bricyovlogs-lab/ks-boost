import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/utils";
import { LICENSE_PLAN_CONFIG } from "@/lib/constants";
import { ClientShell, StatusPill } from "@/components/client-shell";

export default async function DashboardPurchasesPage() {
  const user = await requireUser();
  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ClientShell title="Compras" subtitle="Todos os pagamentos feitos com a sua conta.">
      <div className="premium-panel">
        <div className="real-table-wrap" style={{ marginTop: 0 }}>
          <table className="real-table">
            <thead>
              <tr><th>Produto</th><th>Valor</th><th>Status</th><th>Data</th><th>Referência</th></tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{LICENSE_PLAN_CONFIG[payment.plan]?.label ?? payment.plan}</td>
                  <td>{formatBRL(payment.amount)}</td>
                  <td><StatusPill status={payment.status} /></td>
                  <td>{new Date(payment.createdAt).toLocaleString("pt-BR")}</td>
                  <td><span className="code">{payment.stripeSessionId || "-"}</span></td>
                </tr>
              ))}
              {!payments.length ? <tr><td colSpan={5} className="px-empty">Nenhuma compra encontrada.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </ClientShell>
  );
}
