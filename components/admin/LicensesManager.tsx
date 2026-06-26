'use client'

import { useEffect, useState } from 'react'

type User = { id: string; name?: string; email: string }
type License = { id: string; code: string; status: string; deviceId?: string; createdAt: string; user: User; product: { name: string; type: string } }

export function LicensesManager() {
  const [users, setUsers] = useState<User[]>([])
  const [licenses, setLicenses] = useState<License[]>([])
  const [form, setForm] = useState({ userId: '', productType: 'OPTIMIZER', status: 'ACTIVE' })

  async function load() {
    const [u, l] = await Promise.all([fetch('/api/admin/users'), fetch('/api/admin/licenses')])
    const usersJson = await u.json(); const licensesJson = await l.json()
    setUsers(usersJson); setLicenses(licensesJson)
    if (!form.userId && usersJson[0]) setForm(f => ({ ...f, userId: usersJson[0].id }))
  }
  useEffect(() => { load() }, [])

  async function createLicense(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/admin/licenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    load()
  }
  async function patchLicense(id: string, data: any) { await fetch(`/api/admin/licenses/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); load() }
  async function deleteLicense(id: string) { if (confirm('Deletar esta key?')) { await fetch(`/api/admin/licenses/${id}`, { method: 'DELETE' }); load() } }

  return (
    <section className="space-y-6">
      <div><p className="text-red-400 font-black uppercase tracking-[.25em] text-sm">Sistema de keys</p><h1 className="text-5xl font-black">Licenças / Keys</h1></div>
      <form onSubmit={createLicense} className="rounded-3xl bg-vks-card border border-red-500/20 p-6 glow grid md:grid-cols-4 gap-3">
        <select className="input" value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}>{users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}</select>
        <select className="input" value={form.productType} onChange={e => setForm({ ...form, productType: e.target.value })}><option value="OPTIMIZER">VKS Boost Optimizer</option><option value="PRECISSION_FIX">Precission FIX</option><option value="CROSSHAIR">Crosshair</option></select>
        <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="ACTIVE">Ativa</option><option value="EXPIRED">Expirada</option><option value="BLOCKED">Bloqueada</option></select>
        <button className="btn-red">Gerar key vitalícia</button>
      </form>
      <div className="grid gap-3">
        {licenses.map(lic => <div key={lic.id} className="rounded-3xl bg-vks-card border border-red-500/20 p-5 glow grid lg:grid-cols-5 gap-4 items-center">
          <div className="lg:col-span-2"><p className="text-xs text-zinc-500">KEY</p><b className="text-red-300">{lic.code}</b><p className="text-sm text-zinc-400">{lic.user.email}</p></div>
          <div><p className="text-zinc-400">Produto</p><b>{lic.product.name}</b></div>
          <div><select className="input py-2" value={lic.status} onChange={e => patchLicense(lic.id, { status: e.target.value })}><option value="ACTIVE">Ativa</option><option value="EXPIRED">Expirada</option><option value="BLOCKED">Bloqueada</option></select><p className="text-xs text-zinc-500 mt-1">HWID: {lic.deviceId || 'livre'}</p></div>
          <div className="flex flex-wrap gap-2"><button className="mini-btn" onClick={() => navigator.clipboard.writeText(lic.code)}>Copiar</button><button className="mini-btn" onClick={() => patchLicense(lic.id, { resetDevice: true })}>Reset HWID</button><button className="mini-btn danger" onClick={() => deleteLicense(lic.id)}>Deletar</button></div>
        </div>)}
      </div>
    </section>
  )
}
