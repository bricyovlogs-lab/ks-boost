import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getUserWithRole } from '@/lib/session'
import { getResellerBalance, money, RESELLER_COMMISSION_PERCENT } from '@/lib/reseller'
import { Sidebar } from '@/components/Sidebar'
import { productCatalog } from '@/lib/products'
import { Status } from '@/components/StatusPill'

export const dynamic = 'force-dynamic'

const SAQUE_MSG: Record<string, [string, boolean]> = {
  ok: ['Saque solicitado! O admin vai fazer o PIX em breve.', true],
  pix: ['Informe a sua chave PIX.', false],
  valor: ['Informe um valor válido.', false],
  saldo: ['O valor é maior que o seu saldo disponível.', false],
}

export default async function Revendedor({ searchParams }: { searchParams: Promise<{ saque?: string }> }) {
  const user = await getUserWithRole(['RESELLER', 'ADMIN'])
  if (!user) redirect('/login?next=/revendedor')
  const params = await searchParams

  const [coupons, sales, commissions, payouts, balance] = await Promise.all([
    prisma.coupon.findMany({ where: { resellerId: user.id }, orderBy: { code: 'asc' } }),
    prisma.payment.findMany({
      where: { resellerId: user.id },
      include: { product: true, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.resellerCommission.findMany({ where: { resellerId: user.id } }),
    prisma.payout.findMany({ where: { resellerId: user.id }, orderBy: { createdAt: 'desc' }, take: 10 }),
    getResellerBalance(user.id),
  ])

  const approved = sales.filter((s) => s.status === 'APPROVED')
  const totalSold = approved.reduce((sum, s) => sum + s.amountCents, 0)
  const commissionByPayment = new Map(commissions.map((c) => [c.paymentId, c.amountCents]))
  const msg = params?.saque ? SAQUE_MSG[params.saque] : null
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vks-boost.com'

  return (
    <div className="px-admin">
      <Sidebar email={user.email} variant="reseller" />
      <main className="px-admin-main">
        <div className="px-top">
          <div>
            <div className="px-eyebrow">Área do parceiro</div>
            <h1 className="px-title">Suas <em>vendas.</em></h1>
            <p className="px-sub">Cliente ganha desconto com o seu cupom e você recebe {RESELLER_COMMISSION_PERCENT}% de cada venda aprovada.</p>
          </div>
        </div>

        <div className="px-stats">
          <Stat label="Total vendido" value={money(totalSold)} sub="Pago pelos clientes com o seu cupom" />
          <Stat label="Vendas" value={String(approved.length)} sub={`${sales.length - approved.length} aguardando pagamento`} />
          <Stat label="Sua comissão" value={money(balance.earned)} sub={`${RESELLER_COMMISSION_PERCENT}% de cada venda`} accent />
          <Stat label="Saldo para saque" value={money(balance.available)} sub="Disponível agora" />
        </div>

        <div className="px-grid-2">
          <section className="px-card">
            <div className="px-card-head"><h2>Seus cupons</h2></div>
            {coupons.length === 0 ? <p className="px-empty">Nenhum cupom ainda. Peça ao admin para criar o seu.</p> : null}
            <div className="px-coupons">
              {coupons.map((c) => (
                <div key={c.id} className="px-coupon">
                  <div>
                    <b>{c.code}</b>
                    <span>{c.type === 'PERCENT' ? `${c.value}% de desconto` : `${money(c.value * 100)} de desconto`} · {c.active ? 'Ativo' : 'Inativo'}</span>
                  </div>
                  <code>{appUrl}/checkout?product=OPTIMIZER&amp;cupom={c.code}</code>
                </div>
              ))}
            </div>
            <p className="px-hint">Mande o link acima ou peça para o cliente digitar o cupom no checkout.</p>
          </section>

          <section className="px-card">
            <div className="px-card-head"><h2>Pedir saque PIX</h2><span className="px-chip">{money(balance.available)} disponível</span></div>
            {msg ? <p className={msg[1] ? 'px-ok' : 'px-err'}>{msg[0]}</p> : null}
            <form action="/api/revendedor/saque" method="post" className="px-form">
              <label><span>Chave PIX</span><input className="input" name="pixKey" required placeholder="CPF, email, telefone ou aleatória" /></label>
              <label><span>Valor (R$)</span><input className="input" name="amount" required inputMode="decimal" placeholder="0,00" /></label>
              <button className="btn-red" type="submit">Solicitar saque</button>
            </form>
            {payouts.length ? (
              <div className="px-mini-list">
                {payouts.map((p) => (
                  <div key={p.id}><span>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</span><b>{money(p.amountCents)}</b><Status s={p.status} /></div>
                ))}
              </div>
            ) : null}
          </section>
        </div>

        <section className="px-card">
          <div className="px-card-head"><h2>Vendas recentes</h2></div>
          <div className="px-table-wrap">
            <table className="px-table">
              <thead><tr><th>Data</th><th>Cliente</th><th>Produto</th><th>Cupom</th><th>Valor pago</th><th>Status</th><th>Sua comissão</th></tr></thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td>{new Date(s.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td>{s.user.name || s.user.email.replace(/(.{3}).*(@.*)/, '$1***$2')}</td>
                    <td>{productCatalog[s.product.type as keyof typeof productCatalog]?.name || s.product.name}</td>
                    <td>{s.couponCode || '-'}</td>
                    <td>{money(s.amountCents)}</td>
                    <td><Status s={s.status} /></td>
                    <td className="px-strong">{commissionByPayment.has(s.id) ? money(commissionByPayment.get(s.id) || 0) : '-'}</td>
                  </tr>
                ))}
                {!sales.length ? <tr><td colSpan={7} className="px-empty">Nenhuma venda com o seu cupom ainda.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`px-stat ${accent ? 'is-accent' : ''}`}>
      <div className="px-stat-label">{label}</div>
      <div className="px-stat-value">{value}</div>
      <div className="px-stat-sub">{sub}</div>
    </div>
  )
}
