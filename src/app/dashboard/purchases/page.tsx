import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/utils";

export default async function DashboardPurchasesPage() {
  const user = await requireUser();
  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="panel">
      <div className="container">
        <h1>Histórico de compras</h1>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Plano</th><th>Valor</th><th>Status</th><th>Data</th><th>Stripe Session</th></tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.plan}</td>
                  <td>{formatBRL(payment.amount)}</td>
                  <td>{payment.status}</td>
                  <td>{new Date(payment.createdAt).toLocaleString("pt-BR")}</td>
                  <td>{payment.stripeSessionId || "-"}</td>
                </tr>
              ))}
              {!payments.length ? <tr><td colSpan={5}>Nenhum pagamento encontrado.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
