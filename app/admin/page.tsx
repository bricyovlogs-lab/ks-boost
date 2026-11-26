import { prisma } from '@/lib/prisma'
import { money, RESELLER_COMMISSION_PERCENT } from '@/lib/reseller'
import { productCatalog } from '@/lib/products'

export const dynamic = 'force-dynamic'

export default async function Admin() {
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setDate(since.getDate() - 6)

  const [users, resellers, licenses, revenue, commissions, pendingPayouts, recent, byProduct] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'RESELLER' } }),
    prisma.license.count({ where: { status: 'ACTIVE' } }),
    prisma.payment.aggregate({ _sum: { amountCents: true }, _count: true, where: { status: 'APPROVED' } }),
    prisma.resellerCommission.aggregate({ _sum: { amountCents: true } }),
    prisma.payout.aggregate({ _sum: { amountCents: true }, _count: true, where: { status: 'PENDING' } }),
    prisma.payment.findMany({ where: { status: 'APPROVED', createdAt: { gte: since } }, select: { amountCents: true, createdAt: true } }),
    prisma.payment.groupBy({ by: ['productId'], _count: true, where: { status: 'APPROVED' } }),
  ])

  const products = await prisma.product.findMany()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(since)
    d.setDate(since.getDate() + i)
    const total = recent.filter((p) => p.createdAt.toDateString() === d.toDateString()).reduce((s, p) => s + p.amountCents, 0)
    return { label: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''), total }
  })
  const max = Math.max(1, ...days.map((d) => d.total))
  const weekTotal = days.reduce((s, d) => s + d.total, 0)
  const salesCount = revenue._count || 0
  const productRows = products.map((p) => ({
    name: productCatalog[p.type as keyof typeof productCatalog]?.shortName || p.name,
    count: byProduct.find((b) => b.productId === p.id)?._count || 0,
  }))
  const productMax = Math.max(1, ...productRows.map((p) => p.count))

  return (
    <section>
      <div className="px-top">
        <div>
          <div className="px-eyebrow">Controle total VKS</div>
          <h1 className="px-title">Dashboard<em>.</em></h1>
          <p className="px-sub">Vendas, keys, parceiros e saques em tempo real.</p>
        </div>
      </div>

      <div className="px-stats">
        <div className="px-stat is-accent"><div className="px-stat-label">Receita aprovada</div><div className="px-stat-value">{money(revenue._sum.amountCents || 0)}</div><div className="px-stat-sub">{salesCount} venda{salesCount === 1 ? '' : 's'}</div></div>
        <div className="px-stat"><div className="px-stat-label">Keys ativas</div><div className="px-stat-value">{licenses}</div><div className="px-stat-sub">{users} contas no total</div></div>
        <div className="px-stat"><div className="px-stat-label">Comissões</div><div className="px-stat-value">{money(commissions._sum.amountCents || 0)}</div><div className="px-stat-sub">{resellers} parceiro{resellers === 1 ? '' : 's'} · {RESELLER_COMMISSION_PERCENT}%</div></div>
        <div className="px-stat"><div className="px-stat-label">Saques pendentes</div><div className="px-stat-value">{money(pendingPayouts._sum.amountCents || 0)}</div><div className="px-stat-sub"><a href="/admin/saques">{pendingPayouts._count} para pagar →</a></div></div>
      </div>

      <div className="px-grid-2">
        <div className="px-card">
          <div className="px-card-head"><h2>Vendas dos últimos 7 dias</h2><span className="px-chip">{money(weekTotal)}</span></div>
          <div className="px-bars">
            {days.map((d) => (
              <div key={d.label} className="px-bar">
                <span className="px-bar-value">{d.total ? money(d.total).replace(',00', '') : ''}</span>
                <div className="px-bar-fill" style={{ height: `${Math.max(3, (d.total / max) * 100)}%` }} />
                <span className="px-bar-label">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-card">
          <div className="px-card-head"><h2>Vendas por produto</h2></div>
          <div className="px-hbars">
            {productRows.map((p) => (
              <div key={p.name}>
                <div className="px-hbar-head"><span>{p.name}</span><b>{p.count}</b></div>
                <div className="px-hbar"><div style={{ width: `${(p.count / productMax) * 100}%` }} /></div>
              </div>
            ))}
            {!productRows.length ? <p className="px-empty">Sem vendas ainda.</p> : null}
          </div>
          <div className="px-quick">
            <a href="/admin/usuarios">Criar conta</a><a href="/admin/cupons">Criar cupom</a><a href="/admin/keys">Gerar key</a><a href="/admin/pagamentos">Ver pedidos</a>
          </div>
        </div>
      </div>
    </section>
  )
}
