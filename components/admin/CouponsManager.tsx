'use client'

import { useEffect, useState } from 'react'

type User = { id: string; name?: string; email: string; role: string }
type Coupon = { id: string; code: string; type: string; value: number; active: boolean; reseller?: User }

export function CouponsManager() {
  const [users, setUsers] = useState<User[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [form, setForm] = useState({ code: '', type: 'PERCENT', value: 10, resellerId: '' })

  async function load() {
    const [u, c] = await Promise.all([fetch('/api/admin/users'), fetch('/api/admin/coupons')])
    setUsers(await u.json()); setCoupons(await c.json())
  }
  useEffect(() => { load() }, [])

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/admin/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setForm({ code: '', type: 'PERCENT', value: 10, resellerId: '' }); load()
  }
  async function patchCoupon(id: string, data: any) { await fetch(`/api/admin/coupons/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); load() }
  async function deleteCoupon(id: string) { if (confirm('Deletar cupom?')) { await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' }); load() } }

  const resellers = users.filter(u => u.role === 'RESELLER' || u.role === 'ADMIN')

  return (
    <section className="space-y-6">
      <div><p className="text-red-400 font-black uppercase tracking-[.25em] text-sm">Promoções</p><h1 className="text-5xl font-black">Cupons e Revendedores</h1><p className="text-zinc-400 mt-2">Crie cupons percentuais ou fixos e vincule a revendedores/influencers.</p></div>
      <form onSubmit={createCoupon} className="rounded-3xl bg-vks-card border border-red-500/20 p-6 glow grid lg:grid-cols-5 gap-3">
        <input className="input" placeholder="Código: VKS10" required value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
        <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option value="PERCENT">Percentual %</option><option value="FIXED">Valor fixo R$</option></select>
        <input className="input" type="number" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} />
        <select className="input" value={form.resellerId} onChange={e => setForm({ ...form, resellerId: e.target.value })}><option value="">Sem revendedor</option>{resellers.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}</select>
        <button className="btn-red">Criar cupom</button>
      </form>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {coupons.map(c => <div key={c.id} className="rounded-3xl bg-vks-card border border-red-500/20 p-6 glow">
          <div className="flex items-center justify-between"><b className="text-3xl text-red-400">{c.code}</b><button className={`rounded-full px-3 py-1 text-sm ${c.active ? 'bg-green-500/15 text-green-300' : 'bg-red-500/15 text-red-300'}`} onClick={() => patchCoupon(c.id, { active: !c.active })}>{c.active ? 'Ativo' : 'Inativo'}</button></div>
          <p className="mt-3 text-zinc-300">Desconto: <b>{c.type === 'PERCENT' ? `${c.value}%` : `R$ ${c.value}`}</b></p>
          <p className="text-sm text-zinc-500">Revendedor: {c.reseller?.email || 'nenhum'}</p>
          <div className="flex gap-2 mt-5"><button className="mini-btn" onClick={() => navigator.clipboard.writeText(c.code)}>Copiar</button><button className="mini-btn danger" onClick={() => deleteCoupon(c.id)}>Deletar</button></div>
        </div>)}
      </div>
    </section>
  )
}
