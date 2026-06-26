'use client'

import Image from 'next/image'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()
    setLoading(false)

    if (!response.ok || !data.ok) {
      setMessage(data.message || 'Não foi possível entrar na conta.')
      return
    }

    router.push(data.redirectTo || '/cliente')
    router.refresh()
  }

  return (
    <main className="premium-shell min-h-screen text-white overflow-hidden px-6 py-10 grid place-items-center">
      <span className="floating-dot left-[10%] top-[24%]" />
      <span className="floating-dot left-[82%] top-[30%] [animation-delay:1.4s]" />
      <span className="floating-dot left-[70%] top-[78%] [animation-delay:2.6s]" />
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-[1fr_430px] gap-8 items-center">
        <section className="hidden lg:block">
          <div className="inline-flex items-center gap-3 rounded-full border border-red-500/30 bg-black/45 px-5 py-3 glow">
            <Image src="/images/mascote-vks.png" alt="VKS BOOST" width={48} height={48} className="h-12 w-12 object-contain" />
            <b className="text-2xl text-vks-red brand-title">VKS BOOST</b>
          </div>
          <p className="mt-8 text-vks-red font-black tracking-[.35em] text-sm">ACESSO PREMIUM</p>
          <h1 className="mt-3 text-6xl font-black leading-none">Entre na sua conta e gerencie suas <span className="text-vks-red brand-title">keys gamer</span></h1>
          <p className="mt-6 max-w-xl text-xl text-zinc-300">Painel com licenças, downloads, planos, status de conta e ativação dos aplicativos VKS BOOST.</p>
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-2xl">
            {['Keys automáticas','Downloads liberados','Suporte premium'].map((item) => <div key={item} className="rounded-2xl border border-red-500/20 bg-black/45 p-4 text-center font-bold text-red-100">{item}</div>)}
          </div>
        </section>

        <section className="w-full">
          <div className="mb-5 text-center lg:hidden">
            <Image src="/images/mascote-vks.png" alt="VKS BOOST" width={70} height={70} className="mx-auto h-16 w-16 object-contain" />
            <h2 className="text-3xl font-black text-vks-red brand-title">VKS BOOST</h2>
          </div>
          <form onSubmit={handleLogin} className="auth-card-premium rounded-[2rem] p-8">
            <p className="text-vks-red text-xs font-black tracking-[.35em]">LOGIN SEGURO</p>
            <h1 className="mt-2 text-4xl font-black">Entrar na conta</h1>
            <p className="mt-2 text-sm text-zinc-400">Acesse seu painel de cliente, revendedor ou admin.</p>

            <div className="mt-7 space-y-4">
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="Email" type="email" autoComplete="email" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Senha" type="password" autoComplete="current-password" />
            </div>

            {message && <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{message}</p>}
            <button disabled={loading} className="btn-red mt-6 w-full disabled:opacity-60">{loading ? 'Entrando...' : 'Entrar no painel'}</button>
            <p className="mt-5 text-center text-sm text-zinc-400">Ainda não tem conta? <a className="text-vks-red font-black hover:text-white" href="/register">Criar agora</a></p>
            <a href="/" className="mt-4 block text-center text-xs text-zinc-500 hover:text-red-200">Voltar para página inicial</a>
          </form>
        </section>
      </div>
    </main>
  )
}
