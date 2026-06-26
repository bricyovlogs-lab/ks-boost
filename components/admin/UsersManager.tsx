'use client'

import { useEffect, useState } from 'react'

type User = { id: string; name?: string; email: string; role: string; status: string; createdAt: string; licenses?: any[] }

export function UsersManager() {
  const [users, setUsers] = useState<User[]>([])
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CUSTOMER', status: 'ACTIVE' })
  const [message, setMessage] = useState('')

  async function load() {
    const res = await fetch('/api/admin/users', { cache: 'no-store' })
    setUsers(await res.json())
  }
  useEffect(() => { load() }, [])

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setMessage('Criando usuário...')
    const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setMessage(res.ok ? 'Usuário criado com sucesso.' : 'Erro ao criar usuário.')
    if (res.ok) { setForm({ name: '', email: '', password: '', role: 'CUSTOMER', status: 'ACTIVE' }); load() }
  }

  async function patchUser(id: string, data: any) {
    await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    load()
  }

  async function deleteUser(id: string) {
    if (!confirm('Deseja deletar esta conta? Isso também remove keys/pagamentos vinculados.')) return
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    load()
  }

  async function changePassword(id: string) {
    const password = prompt('Digite a nova senha do usuário:')
    if (!password) return
    await patchUser(id, { password })
    alert('Senha alterada.')
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-red-400 font-black uppercase tracking-[.25em] text-sm">Administração</p>
        <h1 className="text-5xl font-black">Gerenciador de Usuários</h1>
        <p className="text-zinc-400 mt-2">Crie contas, transforme cliente em revendedor, altere senha, bloqueie e delete usuários.</p>
      </div>

      <form onSubmit={createUser} className="rounded-3xl bg-vks-card border border-red-500/20 p-6 glow grid lg:grid-cols-6 gap-3">
        <input className="input" placeholder="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="input" placeholder="Senha" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
          <option value="CUSTOMER">Cliente</option><option value="RESELLER">Revendedor</option><option value="ADMIN">Admin</option>
        </select>
        <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          <option value="ACTIVE">Ativo</option><option value="BLOCKED">Bloqueado</option>
        </select>
        <button className="btn-red">Criar conta</button>
        {message && <p className="lg:col-span-6 text-sm text-red-300">{message}</p>}
      </form>

      <div className="rounded-3xl bg-vks-card border border-red-500/20 overflow-hidden glow">
        <div className="grid grid-cols-12 gap-3 px-5 py-4 text-xs uppercase tracking-widest text-zinc-500 border-b border-red-500/10">
          <span className="col-span-3">Usuário</span><span className="col-span-2">Perfil</span><span className="col-span-2">Status</span><span className="col-span-2">Keys</span><span className="col-span-3">Ações</span>
        </div>
        {users.map(user => (
          <div key={user.id} className="grid grid-cols-12 gap-3 items-center px-5 py-4 border-b border-red-500/10 hover:bg-red-500/5">
            <div className="col-span-3"><b>{user.name || 'Sem nome'}</b><p className="text-sm text-zinc-400">{user.email}</p></div>
            <div className="col-span-2">
              <select className="input py-2" value={user.role} onChange={e => patchUser(user.id, { role: e.target.value })}>
                <option value="CUSTOMER">Cliente</option><option value="RESELLER">Revendedor</option><option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="col-span-2">
              <select className="input py-2" value={user.status} onChange={e => patchUser(user.id, { status: e.target.value })}>
                <option value="ACTIVE">Ativo</option><option value="BLOCKED">Bloqueado</option>
              </select>
            </div>
            <div className="col-span-2 text-red-300 font-black">{user.licenses?.length || 0}</div>
            <div className="col-span-3 flex flex-wrap gap-2">
              <button className="mini-btn" onClick={() => changePassword(user.id)}>Senha</button>
              <a className="mini-btn" href={`/admin/keys?user=${user.id}`}>Add key</a>
              <button className="mini-btn danger" onClick={() => deleteUser(user.id)}>Deletar</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
