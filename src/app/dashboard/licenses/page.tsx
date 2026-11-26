import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { maskKey } from "@/lib/utils";
import { LICENSE_PLAN_CONFIG } from "@/lib/constants";
import { ClientShell, StatusPill } from "@/components/client-shell";

export default async function DashboardLicensesPage() {
  const user = await requireUser();
  const licenses = await prisma.license.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ClientShell title="Minhas keys" subtitle="Suas licenças, o status de cada uma e o PC vinculado.">
      <div className="premium-panel">
        <div className="real-table-wrap" style={{ marginTop: 0 }}>
          <table className="real-table">
            <thead>
              <tr><th>Key</th><th>Produto</th><th>Status</th><th>Validade</th><th>HWID</th></tr>
            </thead>
            <tbody>
              {licenses.map((license) => (
                <tr key={license.id}>
                  <td><span className="code">{maskKey(license.key)}</span></td>
                  <td>{LICENSE_PLAN_CONFIG[license.plan]?.label ?? license.plan}</td>
                  <td><StatusPill status={license.status} /></td>
                  <td>{license.expiresAt ? new Date(license.expiresAt).toLocaleString("pt-BR") : "Vitalícia"}</td>
                  <td>{license.hwid || "-"}</td>
                </tr>
              ))}
              {!licenses.length ? <tr><td colSpan={5} className="px-empty">Nenhuma key ainda. Assim que o pagamento for aprovado ela aparece aqui.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </ClientShell>
  );
}
