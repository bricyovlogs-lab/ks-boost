import { prisma } from '@/lib/prisma'
import { money } from '@/lib/reseller'
import { Status } from '@/components/StatusPill'
import { productCatalog } from '@/lib/products'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const payments = await prisma.payment.findMany({
    include: { product: true, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 150,
  })
  const resellerIds = [...new Set(payments.map((p) => p.resellerId).filter(Boolean))] as string[]
  const resellers = resellerIds.length
    ? await prisma.user.findMany({ where: { id: { in: resellerIds } }, select: { id: true, email: true } })
    : []
  const resellerEmail = new Map(resellers.map((r) => [r.id, r.email]))

  return (
    <section>
      <div className="px-top">
        <div>
          <div className="px-eyebrow">Mercado Pago</div>
          <h1 className="px-title">Pagamentos<em>.</em></h1>
          <p className="px-sub">Últimos 150 pedidos, com cupom e parceiro de cada venda.</p>
        </div>
      </div>
      <div className="px-card">
        <div className="px-table-wrap">
          <table className="px-table">
            <thead><tr><th>Data</th><th>Cliente</th><th>Produto</th><th>Valor</th><th>Cupom</th><th>Parceiro</th><th>Status</th></tr></thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{new Date(p.createdAt).toLocaleString('pt-BR')}</td>
                  <td>{p.user.name || '-'}<br /><small className="px-muted">{p.user.email}</small></td>
                  <td>{productCatalog[p.product.type as keyof typeof productCatalog]?.name || p.product.name}</td>
                  <td className="px-strong">{money(p.amountCents)}{p.discountCents ? <small className="px-muted"> (−{money(p.discountCents)})</small> : null}</td>
                  <td>{p.couponCode || '-'}</td>
                  <td>{p.resellerId ? resellerEmail.get(p.resellerId) || '-' : '-'}</td>
                  <td><Status s={p.status} /></td>
                </tr>
              ))}
              {!payments.length ? <tr><td colSpan={7} className="px-empty">Nenhum pagamento ainda.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
