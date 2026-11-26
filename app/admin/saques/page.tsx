import { prisma } from '@/lib/prisma'
import { money } from '@/lib/reseller'
import { Status } from '@/components/StatusPill'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const payouts = await prisma.payout.findMany({
    include: { reseller: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  const pending = payouts.filter((p) => p.status === 'PENDING')

  return (
    <section>
      <div className="px-top">
        <div>
          <div className="px-eyebrow">Parceiros</div>
          <h1 className="px-title">Saques<em>.</em></h1>
          <p className="px-sub">Faça o PIX para o parceiro e depois marque como pago.</p>
        </div>
        <span className="px-chip">{pending.length} pendente{pending.length === 1 ? '' : 's'} · {money(pending.reduce((s, p) => s + p.amountCents, 0))}</span>
      </div>
      <div className="px-card">
        <div className="px-table-wrap">
          <table className="px-table">
            <thead><tr><th>Data</th><th>Parceiro</th><th>Chave PIX</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id}>
                  <td>{new Date(p.createdAt).toLocaleString('pt-BR')}</td>
                  <td>{p.reseller.name || p.reseller.email}<br /><small className="px-muted">{p.reseller.email}</small></td>
                  <td><code className="px-code">{p.pixKey}</code></td>
                  <td className="px-strong">{money(p.amountCents)}</td>
                  <td><Status s={p.status} /></td>
                  <td>
                    {p.status === 'PENDING' ? (
                      <div className="px-actions">
                        <form action={`/api/admin/payouts/${p.id}`} method="post"><input type="hidden" name="status" value="PAID" /><button className="mini-btn">Marcar pago</button></form>
                        <form action={`/api/admin/payouts/${p.id}`} method="post"><input type="hidden" name="status" value="REJECTED" /><button className="mini-btn danger">Recusar</button></form>
                      </div>
                    ) : '-'}
                  </td>
                </tr>
              ))}
              {!payouts.length ? <tr><td colSpan={6} className="px-empty">Nenhum saque pedido ainda.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
