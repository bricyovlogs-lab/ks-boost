'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Mode = 'login' | 'register'

const Mail = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>
const Lock = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
const User = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
const Arrow = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>

/** Tela de entrar / criar conta — mesma lógica de antes (API /api/auth/login e /register), visual novo. */
export function AuthShell({ mode }: { mode: Mode }) {
  const router = useRouter()
  const isLogin = mode === 'login'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(isLogin ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin ? { email, password } : { name, email, password }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.ok) {
        setMessage(data.message || (isLogin ? 'Não foi possível entrar na conta.' : 'Não foi possível criar a conta.'))
        setLoading(false)
        return
      }
      const next = new URLSearchParams(window.location.search).get('next')
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null
      router.push(safeNext || data.redirectTo || '/cliente')
      router.refresh()
    } catch {
      setMessage('Sem conexão com o servidor. Tente de novo.')
      setLoading(false)
    }
  }

  // Mantém o "?next=" (ex.: voltar para o checkout) ao trocar entre Entrar e Criar conta
  const [nextQuery, setNextQuery] = useState('')
  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get('next')
    if (next) setNextQuery(`?next=${encodeURIComponent(next)}`)
  }, [])
  const keepNext = (href: string) => `${href}${nextQuery}`

  return (
    <main className="ax-page">
      <a href="/" className="ax-home" aria-label="Voltar para o site">
        <svg width="58" height="28" viewBox="0 -6 122 58" aria-hidden="true">
          <g fill="none" stroke="#F5F5F5" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6,14 L18,46 L30,14" /><path d="M48,0 V46" /><path d="M68,14 L52,31 L68,46" />
            <path d="M102.9,18 A8,8 0 1 0 96,30 A8,8 0 1 1 89.1,42" />
          </g>
          <circle cx="114.5" cy="45.5" r="6" fill="#E10600" />
        </svg>
        <span>BOOST</span>
      </a>

      <section className="ax-shell">
        <div className="ax-visual" aria-hidden="true">
          <div className="ax-giant">VKS</div>
          <div className="ax-glow" />
          <img className="ax-gpu" src="/brand/gpu.webp" alt="" />
          <div className="ax-chips"><span><b>+FPS</b> ajustes de jogo</span><span><b>-LAG</b> input lag</span><span><b>1</b> clique</span></div>
        </div>

        <div className="ax-copy">
          <div className="ax-eyebrow">{isLogin ? 'Área do cliente' : 'Criar conta'}</div>
          <h1 className="ax-headline">{isLogin ? <>Bem-vindo<br /><em>de volta.</em></> : <>Seu PC no<br /><em>modo competitivo.</em></>}</h1>
          <p className="ax-lead">{isLogin ? 'Suas keys, downloads e compras em um só lugar.' : 'Cadastre-se para comprar, receber sua key na hora e baixar os apps.'}</p>
        </div>

        <div className="ax-card">
          <div className="ax-tabs">
            <a href={keepNext('/login')} className={isLogin ? 'is-on' : ''}>Entrar</a>
            <a href={keepNext('/register')} className={!isLogin ? 'is-on' : ''}>Criar conta</a>
          </div>
          <h2 className="ax-title">{isLogin ? 'Entrar' : 'Criar conta'}</h2>
          <p className="ax-sub">{isLogin ? 'Use o email e a senha da sua conta.' : 'Leva menos de um minuto.'}</p>

          {message ? <div className="ax-error" role="alert">{message}</div> : null}

          <form className="ax-form" onSubmit={submit}>
            {!isLogin ? (
              <label className="ax-field"><span>Nome</span>
                <div className="ax-input"><User /><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" autoComplete="name" /></div>
              </label>
            ) : null}
            <label className="ax-field"><span>Email</span>
              <div className="ax-input"><Mail /><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="seuemail@exemplo.com" autoComplete="email" /></div>
            </label>
            <label className="ax-field"><span>Senha</span>
              <div className="ax-input"><Lock /><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="••••••••" autoComplete={isLogin ? 'current-password' : 'new-password'} /></div>
            </label>
            <button className="ax-submit" type="submit" disabled={loading}>
              {loading ? (isLogin ? 'Entrando…' : 'Criando…') : (isLogin ? 'Entrar' : 'Criar minha conta')} <Arrow />
            </button>
          </form>

          <div className="ax-switch">
            {isLogin ? <>Ainda não tem conta? <a href={keepNext('/register')}>Criar conta</a></> : <>Já tem conta? <a href={keepNext('/login')}>Entrar</a></>}
          </div>
          <div className="ax-trust"><span>Conexão segura</span><span>Key na hora</span><span>Suporte no Discord</span></div>
        </div>
      </section>
    </main>
  )
}
