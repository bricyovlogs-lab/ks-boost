import Image from 'next/image'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import jwt from 'jsonwebtoken'
import { productCatalog, normalizeProductType } from '@/lib/products'

type JwtUser = { id: string; email: string; name?: string; role: string }

async function getLoggedUser() {
  const token = (await cookies()).get('vks_token')?.value
  if (!token) return null
  try {
    return jwt.verify(token, process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'vksboostsupersecret') as JwtUser
  } catch {
    return null
  }
}

export default async function Checkout({ searchParams }: { searchParams: Promise<{ product?: string; error?: string }> }) {
  const params = await searchParams
  const productType = normalizeProductType(params?.product)
  const product = productCatalog[productType]
  const user = await getLoggedUser()

  if (!user) {
    redirect(`/login?next=/checkout?product=${productType}`)
  }

  return (
    <main className="premium-shell min-h-screen text-white overflow-hidden px-6 py-8">
      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <a href="/" className="inline-flex items-center gap-3">
            <Image src="/images/mascote-vks.png" alt="VKS BOOST" width={58} height={58} className="h-14 w-14 object-contain drop-shadow-[0_0_18px_rgba(255,23,61,.75)]" />
            <b className="text-3xl brand-title"><span className="text-vks-red">VKS</span> <span className="text-white">BOOST</span></b>
          </a>
          <div className="flex gap-3">
            <a href="/cliente" className="rounded-2xl border border-red-500/30 px-5 py-3 font-bold hover:bg-red-500/10 transition">Minha conta</a>
            <a href="/" className="rounded-2xl border border-red-500/30 px-5 py-3 font-bold hover:bg-red-500/10 transition">Voltar ao site</a>
          </div>
        </header>

        <section className="mt-10 grid lg:grid-cols-[1.05fr_.95fr] gap-7 items-start">
          <div className="rounded-[2rem] border border-red-500/25 bg-black/65 p-6 md:p-8 glow-strong">
            <p className="text-vks-red font-black tracking-[.35em] text-sm">TERMOS DE COMPRA</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-black">Confirme sua compra</h1>
            <p className="mt-3 text-zinc-400">Leia e aceite os termos para seguir para o Mercado Pago. A key é liberada automaticamente após aprovação.</p>

            {params?.error && <p className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">Não foi possível iniciar o pagamento. Confira o token Mercado Pago na Vercel e tente novamente.</p>}

            <div className="terms-box mt-6 rounded-2xl border border-red-500/25 bg-black/55 p-5 text-sm leading-relaxed text-zinc-300">
              <h2>TERMOS DE COMPRA – VKS BOOST</h2>
              <p>Ao adquirir qualquer produto, serviço ou licença da VKS BOOST, o cliente declara que leu, compreendeu e concorda integralmente com os termos abaixo.</p>
              <h3>1. Sobre os Produtos</h3>
              <p>A VKS BOOST oferece produtos e serviços digitais voltados para otimização de desempenho, melhoria de experiência em jogos, configurações avançadas de sistema operacional e softwares auxiliares para jogadores.</p>
              <p>Todos os produtos são comercializados exclusivamente de forma digital, não havendo envio de qualquer produto físico.</p>
              <p>Após a confirmação do pagamento, o cliente receberá acesso ao produto adquirido através de download, licença digital (key), painel do cliente ou outro método disponibilizado pela plataforma.</p>
              <h3>2. Entrega do Produto</h3>
              <p>A entrega ocorre de forma automática e digital após a confirmação do pagamento pela instituição financeira responsável.</p>
              <p>O acesso poderá ser disponibilizado pela área do cliente no site, download direto, chave de ativação ou e-mail cadastrado.</p>
              <p>Em situações excepcionais, a liberação poderá sofrer atraso devido a instabilidades de sistemas de terceiros, processadores de pagamento ou servidores.</p>
              <h3>3. Licença de Uso</h3>
              <p>Ao adquirir um produto da VKS BOOST, o cliente recebe uma licença de uso pessoal, individual, limitada, revogável e intransferível.</p>
              <p>É proibido compartilhar, vender ou emprestar a licença, revender sem autorização, distribuir, copiar ou modificar softwares, burlar sistemas de proteção/licenciamento ou utilizar os produtos para fins ilícitos.</p>
              <p>O descumprimento dessas regras poderá resultar na suspensão ou cancelamento definitivo da licença sem direito a reembolso.</p>
              <h3>4. Sobre os Resultados de Otimização</h3>
              <p>A VKS BOOST trabalha para oferecer soluções de otimização buscando melhorar fluidez, estabilidade e desempenho dos computadores utilizados para jogos.</p>
              <p>O cliente está ciente de que resultados variam conforme hardware, sistema operacional, drivers, configurações e condições específicas de cada máquina. Não prometemos quantidade exata de FPS, desempenho ou redução de latência.</p>
              <p>Nosso compromisso é aplicar as melhores práticas e configurações disponíveis para extrair o máximo potencial do equipamento, priorizando estabilidade e integridade do sistema.</p>
              <h3>5. Política de Reembolso</h3>
              <p>Devido à natureza digital dos produtos e ao fornecimento imediato de acesso, downloads, licenças ou conteúdos digitais, não realizamos reembolso após a entrega da licença ou disponibilização do produto.</p>
              <p>Exceções poderão ser analisadas em casos de falha comprovada na entrega, erro técnico que impeça totalmente a utilização do serviço ou problemas diretamente causados pela plataforma da VKS BOOST.</p>
              <h3>6. Responsabilidade do Cliente</h3>
              <p>É responsabilidade do cliente verificar requisitos mínimos, manter drivers e sistema operacional atualizados, seguir tutoriais e usar os produtos de acordo com sua finalidade.</p>
              <h3>7. Suporte Técnico</h3>
              <p>A VKS BOOST oferece suporte para instalação, ativação de licenças, dúvidas de funcionamento e correção de problemas técnicos relacionados aos serviços contratados.</p>
              <h3>8. Atualizações</h3>
              <p>Os produtos poderão receber atualizações, melhorias, correções de bugs e novos recursos sem aviso prévio.</p>
              <h3>9. Cancelamento, Bloqueio e Suspensão</h3>
              <p>A VKS BOOST reserva-se o direito de suspender ou cancelar licenças em caso de compartilhamento, fraude, engenharia reversa ou violação destes termos.</p>
              <h3>10. Limitação de Responsabilidade</h3>
              <p>A VKS BOOST não será responsável por perda de dados causada por ações externas, problemas de hardware, softwares de terceiros, quedas de energia, falhas de internet ou resultados específicos esperados pelo usuário.</p>
              <h3>11. Aceitação dos Termos</h3>
              <p>Ao realizar a compra, o cliente declara que leu estes termos, compreendeu as condições, está ciente de que resultados podem variar e concorda com a política de licenciamento, suporte e reembolso.</p>
              <p><strong>Última atualização: 26/06/2026</strong></p>
              <p><strong>VKS BOOST – Mais desempenho, mais fluidez e mais competitividade para seus jogos.</strong></p>
            </div>
          </div>

          <aside className="sticky top-6 rounded-[2rem] border border-red-500/30 bg-gradient-to-br from-red-950/40 via-black to-black p-6 md:p-8 glow-strong">
            <p className="text-vks-red font-black tracking-[.35em] text-xs">RESUMO DO PEDIDO</p>
            <div className="mt-5 flex items-start gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-red-500/30 bg-red-500/10 text-3xl">{product.icon}</div>
              <div>
                <h2 className="text-3xl font-black">{product.name}</h2>
                <p className="mt-2 text-zinc-400">{product.description}</p>
              </div>
            </div>
            <div className="mt-7 rounded-2xl border border-red-500/20 bg-black/45 p-5">
              <div className="flex items-center justify-between text-zinc-400"><span>Preço original</span><span className="line-through">{product.oldPrice}</span></div>
              <div className="mt-3 flex items-end justify-between"><span className="text-zinc-300">Total hoje</span><strong className="text-5xl font-black text-white">{product.price}</strong></div>
              <p className="mt-2 text-sm text-red-200">Pagamento único • licença vitalícia</p>
            </div>
            <ul className="mt-6 space-y-3 text-zinc-200">
              {product.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
            </ul>
            <form action="/api/checkout/create" method="post" className="mt-7">
              <input type="hidden" name="product" value={productType} />
              <label className="flex gap-3 rounded-2xl border border-red-500/20 bg-black/45 p-4 text-sm text-zinc-300">
                <input required type="checkbox" name="acceptedTerms" value="yes" className="mt-1 h-5 w-5 accent-red-500" />
                <span>Li e aceito os Termos de Compra, política de licença, entrega digital e reembolso da VKS BOOST.</span>
              </label>
              <button className="mt-5 w-full rounded-2xl bg-vks-red py-4 text-lg font-black text-white shadow-[0_0_32px_rgba(255,23,61,.45)] hover:scale-[1.02] transition">Aceitar termos e ir para o Mercado Pago</button>
            </form>
            <p className="mt-4 text-center text-xs text-zinc-500">Você está comprando logado como {user?.email}.</p>
          </aside>
        </section>
      </div>
    </main>
  )
}
