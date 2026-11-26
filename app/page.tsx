import './home.css'
import { getSession } from '@/lib/session'
import { StoryExperience } from '@/components/story/story-experience'

const testimonials = [
  ['FPS mais estável e PC muito mais liso. Antes travava no RP, agora roda fluido.', 'Rafael', 'FiveM'],
  ['Minha mira ficou bem mais controlada. Senti diferença já na primeira configuração.', 'Lucas', 'Valorant'],
  ['Setup ficou pronto sem complicação. Atendimento rápido e resultado real.', 'Matheus', 'CS2'],
  ['O PC ficou mais leve e abriu os jogos mais rápido. Valeu muito a pena.', 'Gustavo', 'Fortnite'],
  ['Peguei o Optimizer + Placa de Vídeo e o PC ficou muito mais estável nos jogos.', 'Pedro', 'FiveM'],
  ['O Windows Lite deixou o sistema bem mais leve e rápido para jogar.', 'Bruno', 'Valorant'],
  ['Comprei a key e liberou certinho na conta. Processo simples e automático.', 'Henrique', 'CS2'],
  ['Meu notebook parou de engasgar tanto. Ficou outro nível para jogar.', 'Thiago', 'FiveM'],
]

const plans = [
  { type: 'OPTIMIZER', name: 'VKS Boost Optimizer', old: '100,90', price: '49,90', items: ['Windows 10/11 otimizado', 'Melhor desempenho em jogos', 'Otimizador completo', 'Licença vitalícia', 'Liberação automática da key'] },
  { type: 'PRECISSION_FIX', name: 'VKS Optimizer + Placa de Vídeo', old: '159,90', price: '119,90', featured: true, items: ['VKS Optimizer completo', 'Otimização da placa de vídeo', 'Mais FPS e estabilidade', 'Licença vitalícia', 'Suporte para configuração'] },
  { type: 'CROSSHAIR', name: 'VKS Windows Lite', old: '59,90', price: '29,90', items: ['Windows mais leve', 'Menos processos em segundo plano', 'Melhor desempenho', 'Licença vitalícia', 'Instalação simplificada'] },
]

const faq = [
  ['O que acontece depois da compra?', 'Após o pagamento aprovado, sua key é liberada automaticamente na sua conta.'],
  ['Como o app sabe qual key está ativa?', 'O aplicativo consulta sua conta e identifica se a key ativa é do VKS Boost Optimizer, VKS Optimizer + Placa de Vídeo ou VKS Windows Lite.'],
  ['Posso ter os três aplicativos?', 'Sim, cada produto possui sua própria key e pode ser ativado separadamente.'],
  ['O pagamento é automático?', 'Sim, o pagamento via Mercado Pago libera a key automaticamente após aprovação.'],
  ['Tenho cupom de um parceiro, onde uso?', 'No checkout tem o campo "Cupom de desconto". O desconto aparece antes de você ir para o Mercado Pago.'],
]

export default async function Home() {
  const session = await getSession()
  const buy = (type: string) => (session ? `/checkout?product=${type}` : `/login?next=${encodeURIComponent(`/checkout?product=${type}`)}`)
  const profileHref = session?.role === 'ADMIN' ? '/admin' : session?.role === 'RESELLER' ? '/revendedor' : '/cliente'

  return (
    <div className="vx-page">
      <header className="vx-header">
        <div className="vx-header-in">
          <a href="/" className="vx-logo" aria-label="VKS BOOST">
            <svg width="58" height="28" viewBox="0 -6 122 58" aria-hidden="true">
              <g fill="none" stroke="#F5F5F5" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6,14 L18,46 L30,14" /><path d="M48,0 V46" /><path d="M68,14 L52,31 L68,46" />
                <path d="M102.9,18 A8,8 0 1 0 96,30 A8,8 0 1 1 89.1,42" />
              </g>
              <circle cx="114.5" cy="45.5" r="6" fill="#E10600" />
            </svg>
            <span>BOOST</span>
          </a>
          <nav className="vx-nav">
            <a href="#planos">Planos</a>
            <a href="#depoimentos">Depoimentos</a>
            <a href="#faq">FAQ</a>
            {session ? <a href={profileHref}>Perfil</a> : <a href="/login">Entrar</a>}
            <a className="vx-nav-cta" href={session ? profileHref : '/register'}>{session ? 'Minha conta' : 'Criar conta'}</a>
          </nav>
        </div>
      </header>

      <StoryExperience buyHref={buy('PRECISSION_FIX')} />

      <section className="vx-section" id="planos">
        <div className="vx-inner">
          <div className="vx-head">
            <div>
              <div className="vx-eyebrow vx-eyebrow--promo">Promoção ativa</div>
              <h2 className="vx-title">Planos com <em>desconto.</em></h2>
              <p className="vx-text">Valores promocionais para as primeiras ativações. Garanta sua key vitalícia.</p>
            </div>
            <div className="vx-stock">⚠ Estoque de keys limitado</div>
          </div>
          <div className="vx-plans">
            {plans.map((p) => (
              <div className={`vx-plan ${p.featured ? 'is-featured' : ''}`} key={p.type}>
                <div className="vx-plan-tags">{p.featured ? <span className="vx-plan-hot">Mais vendido</span> : <span />}<span className="vx-plan-tag">Vitalício</span></div>
                <h3 className="vx-plan-name">{p.name}</h3>
                <div className="vx-plan-old">De R$ {p.old}</div>
                <div className="vx-plan-price">R$ {p.price}</div>
                <div className="vx-plan-once">Pagamento único · Sem mensalidade</div>
                <ul className="vx-plan-list">{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
                <a className="vx-btn vx-btn--red vx-plan-buy" href={buy(p.type)}>Comprar agora e ativar key</a>
                <div className="vx-plan-foot">Liberação automática após aprovação do pagamento</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="vx-section vx-section--tight" id="depoimentos">
        <div className="vx-inner">
          <div className="vx-head"><div><div className="vx-eyebrow">Validações reais</div><h2 className="vx-title">Quem usa, <em>sente.</em></h2></div></div>
        </div>
        <div className="vx-marquee">
          <div className="vx-marquee-track">
            {[...testimonials, ...testimonials].map((t, i) => (
              <div className="vx-quote" key={`${t[1]}-${i}`}>
                <div className="vx-stars">★★★★★</div>
                <p>“{t[0]}”</p>
                <strong>{t[1]}</strong><span>Usado em {t[2]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="vx-section" id="faq">
        <div className="vx-inner vx-faq-wrap">
          <div><div className="vx-eyebrow">FAQ</div><h2 className="vx-title">Perguntas <em>frequentes.</em></h2></div>
          <div className="vx-faq">
            {faq.map((f) => (
              <details key={f[0]}><summary>{f[0]}</summary><p>{f[1]}</p></details>
            ))}
          </div>
        </div>
      </section>

      <footer className="vx-footer">
        <div className="vx-inner">
          <span>© {new Date().getFullYear()} VKS BOOST — performance, otimização e ativação premium.</span>
          <span><a href="/checkout?product=OPTIMIZER">Termos de compra</a> · <a href="https://discord.com/invite/vksboost" target="_blank" rel="noreferrer">Suporte no Discord</a></span>
        </div>
      </footer>

      <a href="https://discord.com/invite/vksboost" target="_blank" rel="noreferrer" aria-label="Suporte VKS no Discord" title="Suporte no Discord" className="vx-discord">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.6 1.2a18.3 18.3 0 0 0-5.6 0L8.6 3a19.7 19.7 0 0 0-4.9 1.5C.6 9.1-.3 13.6.1 18.1a19.9 19.9 0 0 0 6 3l1.3-2a12.9 12.9 0 0 1-2-1l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1l1.3 2a19.8 19.8 0 0 0 6-3c.5-5.2-.8-9.7-3.6-13.7ZM8 15.3c-1.2 0-2.2-1.1-2.2-2.4S6.8 10.5 8 10.5s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z" /></svg>
      </a>
    </div>
  )
}
