import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { prisma } from '../../lib/prisma'

type JwtUser = { id: string; email: string; name?: string; role: string }

function money(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const productInfo = {
  OPTIMIZER: {
    icon: '⚡',
    name: 'VKS Boost Optimizer',
    old: 'R$ 100,90',
    price: 'R$ 49,90',
    desc: 'Otimização completa para Windows 10/11, mais FPS, menos travamentos e melhor fluidez nos jogos.',
    features: ['Windows 10/11 otimizado', 'Remoção de gargalos', 'Licença vitalícia', 'Setup gamer premium'],
    download: '#download-optimizer',
  },
  PRECISSION_FIX: {
    icon: '🎯',
    name: 'VKS Precission FIX',
    old: 'R$ 159,90',
    price: 'R$ 79,90',
    desc: 'Ajustes competitivos para melhorar controle de mira, resposta e precisão no mouse/teclado.',
    features: ['Ajustes para precisão', 'Controle de mira', 'Configurações competitivas', 'Licença vitalícia'],
    download: '#download-precision',
  },
  CROSSHAIR: {
    icon: '✚',
    name: 'VKS Crosshair',
    old: 'R$ 15,90',
    price: 'R$ 10,00',
    desc: 'Mira personalizada na tela para jogos, ideal para quem quer visual mais limpo e competitivo.',
    features: ['Crosshair para jogos', 'Visual limpo', 'Configuração rápida', 'Baixo consumo'],
    download: '#download-crosshair',
  },
} as const

async function getLoggedUser() {
  const token = (await cookies()).get('vks_token')?.value
  if (!token) return null
  try {
    return jwt.verify(token, process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'vksboostsupersecret') as JwtUser
  } catch {
    return null
  }
}

export default async function Cliente() {
  const session = await getLoggedUser()
  const user = session?.id
    ? await prisma.user.findUnique({
        where: { id: session.id },
        include: { licenses: { include: { product: true }, orderBy: { createdAt: 'desc' } }, payments: { include: { product: true }, orderBy: { createdAt: 'desc' } } },
      })
    : null

  const activeLicenses = user?.licenses.filter((l) => l.status === 'ACTIVE') || []
  const activeTypes = new Set(activeLicenses.map((l) => l.product.type))
  const products = Object.entries(productInfo)

  return (
    <main className="min-h-screen bg-vks-dark text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none gamer-bg opacity-80" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-vks-red font-black tracking-[.35em] text-sm">ÁREA DO CLIENTE</p>
            <h1 className="text-4xl md:text-6xl font-black mt-2">Painel Cliente</h1>
            <p className="text-zinc-400 mt-3">Gerencie suas keys, baixe seus aplicativos e adquira novos planos VKS BOOST.</p>
          </div>
          <div className="flex gap-3">
            <a href="/" className="rounded-2xl border border-red-500/30 px-5 py-3 font-bold hover:bg-red-500/10 transition">Voltar ao site</a>
            <form action="/api/auth/logout" method="post">
              <button className="rounded-2xl bg-red-500 px-5 py-3 font-black shadow-[0_0_24px_rgba(255,23,61,.35)] hover:scale-[1.03] transition">Sair da conta</button>
            </form>
          </div>
        </header>

        <section className="grid md:grid-cols-4 gap-4 mt-8">
          <Stat title="Usuário" value={user?.name || session?.name || 'Cliente'} small={user?.email || session?.email || 'Faça login'} />
          <Stat title="Keys ativas" value={String(activeLicenses.length)} small="Licenças liberadas" />
          <Stat title="Produtos disponíveis" value="3" small="Optimizer, Precision e Crosshair" />
          <Stat title="Status da conta" value={user?.status || 'ACTIVE'} small="Conta premium gamer" />
        </section>

        <section className="mt-10 grid xl:grid-cols-[1.1fr_.9fr] gap-6">
          <div className="rounded-[2rem] border border-red-500/25 bg-vks-card/80 p-6 glow">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-vks-red text-sm font-black tracking-[.25em]">MINHAS LICENÇAS</p>
                <h2 className="text-3xl font-black">Keys ativas</h2>
              </div>
              <span className="rounded-full bg-red-500/10 border border-red-500/25 px-4 py-2 text-sm text-red-200">{activeLicenses.length} ativa(s)</span>
            </div>

            <div className="space-y-4">
              {activeLicenses.length === 0 && (
                <div className="rounded-2xl border border-red-500/20 bg-black/40 p-5 text-zinc-300">Você ainda não possui keys ativas. Escolha um plano abaixo para liberar seu produto.</div>
              )}
              {activeLicenses.map((license) => {
                const info = productInfo[license.product.type as keyof typeof productInfo]
                return (
                  <div key={license.id} className="rounded-2xl border border-red-500/25 bg-black/45 p-5 grid md:grid-cols-[1fr_auto] gap-4 items-center">
                    <div>
                      <p className="text-sm text-zinc-500">KEY</p>
                      <h3 className="text-xl font-black text-red-200 tracking-wide">{license.code}</h3>
                      <p className="text-zinc-300 mt-2"><span className="text-white font-bold">{info?.name || license.product.name}</span> • {license.lifetime ? 'Licença vitalícia' : 'Licença com validade'}</p>
                      <p className="text-xs text-zinc-500 mt-1">HWID/device: {license.deviceId || 'livre para ativação'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <button className="rounded-xl border border-red-500/30 px-4 py-3 font-bold hover:bg-red-500/10">Copiar key</button>
                      <a href={info?.download || '#'} className="rounded-xl bg-red-500 px-5 py-3 font-black shadow-[0_0_18px_rgba(255,23,61,.3)]">Baixar app</a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-red-500/25 bg-gradient-to-br from-red-950/40 to-black p-6 glow">
            <p className="text-vks-red text-sm font-black tracking-[.25em]">DOWNLOADS</p>
            <h2 className="text-3xl font-black mt-1">Central de aplicativos</h2>
            <p className="text-zinc-400 mt-2">O botão libera melhor quando você tem a key ativa do produto.</p>
            <div className="mt-5 space-y-4">
              {products.map(([type, info]) => {
                const hasKey = activeTypes.has(type as any)
                return <DownloadCard key={type} info={info} hasKey={hasKey} />
              })}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
            <div>
              <p className="text-vks-red text-sm font-black tracking-[.25em]">ADQUIRIR PLANOS</p>
              <h2 className="text-4xl font-black">Comprar novas keys</h2>
              <p className="text-zinc-400 mt-2">Promoção vitalícia por tempo limitado. Garanta sua key antes do reajuste.</p>
            </div>
            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-5 py-3 text-red-100 font-bold">🔥 Estoque promocional limitado</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {products.map(([type, info]) => (
              <PlanCard key={type} type={type} info={info} owned={activeTypes.has(type as any)} />
            ))}
          </div>
        </section>

        <section className="mt-10 grid lg:grid-cols-3 gap-5 pb-10">
          <InfoCard title="Como funciona?" text="Após comprar, a key aparece automaticamente na sua conta. O app consulta sua licença e libera o produto correto." />
          <InfoCard title="Posso ter todos?" text="Sim. Optimizer, Precission FIX e Crosshair possuem keys separadas e podem ficar ativos juntos." />
          <InfoCard title="Suporte premium" text="Use seu email cadastrado para solicitar ajuda, reset de dispositivo ou suporte de instalação." />
        </section>
      </div>
    </main>
  )
}

function Stat({ title, value, small }: { title: string; value: string; small: string }) {
  return (
    <div className="rounded-3xl bg-vks-card/80 border border-red-500/25 p-5 glow">
      <p className="text-zinc-400 text-sm">{title}</p>
      <p className="text-2xl font-black text-vks-red mt-1 truncate">{value}</p>
      <p className="text-xs text-zinc-500 mt-2 truncate">{small}</p>
    </div>
  )
}

function DownloadCard({ info, hasKey }: { info: any; hasKey: boolean }) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-black/45 p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-500/10 border border-red-500/25 text-2xl">{info.icon}</div>
        <div>
          <h3 className="font-black">{info.name}</h3>
          <p className={hasKey ? 'text-emerald-300 text-sm' : 'text-zinc-500 text-sm'}>{hasKey ? 'Liberado para download' : 'Key necessária'}</p>
        </div>
      </div>
      <a href={hasKey ? info.download : '#planos'} className={hasKey ? 'rounded-xl bg-red-500 px-4 py-3 font-black' : 'rounded-xl border border-red-500/30 px-4 py-3 font-bold text-red-200'}>{hasKey ? 'Baixar' : 'Comprar'}</a>
    </div>
  )
}

function PlanCard({ type, info, owned }: { type: string; info: any; owned: boolean }) {
  return (
    <div id="planos" className="relative rounded-[2rem] border border-red-500/30 bg-black/70 p-6 glow overflow-hidden">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="text-4xl">{info.icon}</span>
          <span className="rounded-full bg-red-500/10 border border-red-500/25 px-3 py-1 text-xs font-bold text-red-100">{owned ? 'Você já possui' : 'PROMO VITALÍCIA'}</span>
        </div>
        <h3 className="mt-4 text-2xl font-black text-vks-red">{info.name}</h3>
        <p className="text-zinc-400 mt-2 min-h-[72px]">{info.desc}</p>
        <div className="mt-5">
          <p className="text-zinc-500 line-through">de {info.old}</p>
          <p className="text-4xl font-black">por {info.price}</p>
          <p className="text-red-200 text-sm mt-1">Pagamento único • key vitalícia</p>
        </div>
        <ul className="mt-5 space-y-2 text-sm text-zinc-200">
          {info.features.map((f: string) => <li key={f}>✓ {f}</li>)}
        </ul>
        <a href={`/checkout?product=${type}`} className="mt-6 block rounded-2xl bg-red-500 py-4 text-center font-black shadow-[0_0_28px_rgba(255,23,61,.35)] hover:scale-[1.02] transition">
          {owned ? 'Comprar outra key' : 'Comprar agora'}
        </a>
      </div>
    </div>
  )
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return <div className="rounded-3xl bg-vks-card/75 border border-red-500/20 p-6"><h3 className="text-xl font-black text-red-100">{title}</h3><p className="text-zinc-400 mt-2">{text}</p></div>
}
