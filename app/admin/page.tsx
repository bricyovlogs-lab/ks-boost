import { prisma } from '../../lib/prisma'
import { BarChartCard, DonutChartCard } from '../../components/admin/AdminCharts'

function money(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function Admin() {
  const [users, payments, licenses, coupons, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.payment.count(),
    prisma.license.count(),
    prisma.coupon.count(),
    prisma.payment.aggregate({ _sum: { amountCents: true }, where: { status: 'APPROVED' } }),
  ])

  const cards = [
    { label: 'Usuários cadastrados', value: users, info: 'clientes, admins e revendedores' },
    { label: 'Pedidos', value: payments, info: 'histórico Mercado Pago' },
    { label: 'Licenças/Keys', value: licenses, info: 'ativas, bloqueadas e expiradas' },
    { label: 'Cupons', value: coupons, info: 'campanhas e revendedores' },
    { label: 'Receita aprovada', value: money(revenue._sum.amountCents || 0), info: 'pagamentos aprovados' },
    { label: 'Status do sistema', value: 'Online', info: 'Neon + Prisma ativo' },
  ]

  return (
    <section className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-red-400 font-black uppercase tracking-[.25em] text-sm">Controle total VKS</p>
          <h1 className="text-5xl font-black">Dashboard Admin</h1>
        </div>
        <div className="rounded-2xl border border-red-500/25 bg-red-950/20 px-5 py-3 text-sm text-zinc-300">
          Painel para vendas, keys, usuários e cupons
        </div>
      </div>

      <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-3xl bg-vks-card border border-red-500/20 p-6 glow hover:border-red-500/50 transition">
            <p className="text-zinc-400">{card.label}</p>
            <b className="block text-3xl text-vks-red mt-2">{card.value}</b>
            <small className="text-zinc-500">{card.info}</small>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <BarChartCard />
        <DonutChartCard />
      </div>

      <div className="rounded-3xl bg-gradient-to-r from-red-950/40 to-black border border-red-500/20 p-6 glow">
        <h3 className="text-2xl font-black mb-2">Ações rápidas</h3>
        <p className="text-zinc-400 mb-4">Use o menu lateral para criar contas, transformar cliente em revendedor, gerar keys, bloquear licenças e criar cupons.</p>
        <div className="grid md:grid-cols-4 gap-3 text-sm">
          <a className="rounded-2xl bg-red-500 px-4 py-3 font-black text-center" href="/admin/usuarios">Gerenciar usuários</a>
          <a className="rounded-2xl border border-red-500/40 px-4 py-3 font-black text-center" href="/admin/keys">Gerar key</a>
          <a className="rounded-2xl border border-red-500/40 px-4 py-3 font-black text-center" href="/admin/cupons">Criar cupom</a>
          <a className="rounded-2xl border border-red-500/40 px-4 py-3 font-black text-center" href="/admin/pagamentos">Ver pedidos</a>
        </div>
      </div>
    </section>
  )
}
