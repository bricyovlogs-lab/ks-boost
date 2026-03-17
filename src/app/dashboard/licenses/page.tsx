import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { maskKey } from "@/lib/utils";

export default async function DashboardLicensesPage() {
  const user = await requireUser();
  const licenses = await prisma.license.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="panel">
      <div className="container">
        <h1>Minhas licenças</h1>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Key</th><th>Plano</th><th>Status</th><th>Validade</th><th>HWID</th></tr>
            </thead>
            <tbody>
              {licenses.map((license) => (
                <tr key={license.id}>
                  <td><span className="code">{maskKey(license.key)}</span></td>
                  <td>{license.plan}</td>
                  <td>{license.status}</td>
                  <td>{license.expiresAt ? new Date(license.expiresAt).toLocaleString("pt-BR") : "Vitalícia"}</td>
                  <td>{license.hwid || "-"}</td>
                </tr>
              ))}
              {!licenses.length ? <tr><td colSpan={5}>Nenhuma licença encontrada.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
