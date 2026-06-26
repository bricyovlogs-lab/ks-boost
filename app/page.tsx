import Image from 'next/image'

const testimonials = [
  ['FPS mais estável e PC muito mais liso. Antes travava no RP, agora roda fluido.', 'Rafael', 'FiveM'],
  ['Minha mira ficou bem mais controlada. Senti diferença já na primeira configuração.', 'Lucas', 'Valorant'],
  ['Setup ficou pronto sem complicação. Atendimento rápido e resultado real.', 'Matheus', 'CS2'],
  ['O PC ficou mais leve e abriu os jogos mais rápido. Valeu muito a pena.', 'Gustavo', 'Fortnite'],
  ['Usei o Precission FIX e consegui deixar minha sens muito mais consistente.', 'Pedro', 'FiveM'],
  ['O Crosshair ajudou demais para treinar foco e posicionamento de tela.', 'Bruno', 'Valorant'],
  ['Comprei a key e liberou certinho na conta. Processo simples e automático.', 'Henrique', 'CS2'],
  ['Meu notebook parou de engasgar tanto. Ficou outro nível para jogar.', 'Thiago', 'FiveM'],
]

const products = [
  {
    title:'VKS Boost Optimizer',
    tag:'Windows gamer otimizado',
    text:'Transforme seu Windows 10/11 em uma máquina mais leve para jogos. Menos gargalo, mais fluidez, inicialização limpa e ajustes focados em desempenho competitivo.',
    bullets:['Mais FPS estável','Menos processos inúteis','Otimização vitalícia','Ideal para FiveM, CS2, Valorant e Fortnite'],
    image:'/images/preview-optimizer.png'
  },
  {
    title:'VKS Precission FIX',
    tag:'Precisão e resposta nos jogos',
    text:'Ajustes competitivos para melhorar controle de mira, sensação do mouse e resposta nos games. Feito para quem quer jogar com mais consistência e confiança.',
    bullets:['Controle de mira mais firme','Ajustes de sensibilidade','Perfil competitivo','Menos sensação de input lag'],
    image:'/images/preview-precision.png'
  },
  {
    title:'VKS Crosshair',
    tag:'Mira personalizada na tela',
    text:'Painel simples e direto para ativar crosshair personalizado em jogos. Ideal para treinar foco, alinhar mira e deixar seu setup com visual mais competitivo.',
    bullets:['Crosshair para jogos','Visual personalizável','Leve e rápido','Perfeito para treinos e highlights'],
    image:'/images/preview-crosshair.png'
  }
]

const plans = [
  ['VKS Boost Optimizer','100,90','49,90',['Windows 10/11 otimizado','Melhor desempenho em jogos','Otimizador completo','Licença vitalícia','Liberação automática da key']],
  ['VKS Precission FIX','159,90','79,90',['Ajustes para precisão','Melhor controle de mira','Configurações competitivas','Licença vitalícia','Perfil para jogadores competitivos']],
  ['VKS Crosshair','15,90','10,00',['Painel de crosshair','Mira personalizada','Leve para jogos','Licença vitalícia','Instalação simples']],
] as const

export default function Home(){return <main className="gamer-bg text-white overflow-hidden"><Header/><section className="hero-video-wrap relative min-h-[780px] overflow-hidden"><HeroVideo/><div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-10 px-6 py-24 md:py-32 items-center min-h-[780px]"><div className="hero-content-clean"><p className="text-vks-red font-black tracking-widest">PERFORMANCE GAMER PREMIUM</p><h1 className="text-5xl md:text-7xl font-black mt-4 leading-none">Conheça a <span className="text-vks-red brand-title">VKS BOOST</span></h1><p className="text-2xl text-zinc-200 mt-6">Se torne mais competitivo nos games com otimização, precisão e visual gamer profissional.</p><div className="flex flex-wrap gap-4 mt-8"><a href="#planos" className="rounded-2xl bg-vks-red px-8 py-4 font-black glow hover:scale-105 transition">Comprar agora</a><a href="#produtos" className="rounded-2xl border border-red-500/35 bg-black/55 px-8 py-4 font-black hover:border-vks-red transition">Conhecer produtos</a></div><p className="mt-5 text-sm text-zinc-300">🔥 Oferta por tempo limitado: keys vitalícias com preço promocional.</p></div><div className="relative hidden md:block"><Image src="/images/mascote-vks.png" alt="Mascote VKS BOOST" width={650} height={650} className="relative z-10 mx-auto drop-shadow-[0_0_65px_rgba(255,23,61,.55)] opacity-95" priority/></div></div></section><div className="h-px redline"/><section id="produtos" className="relative z-10 max-w-7xl mx-auto px-6 py-24"><div className="text-center mb-14"><p className="text-vks-red font-black tracking-widest">ESCOLHA SUA VANTAGEM</p><h2 className="text-5xl md:text-6xl font-black mt-3">PRODUTOS</h2><p className="text-zinc-400 mt-4 max-w-2xl mx-auto">Soluções criadas para deixar seu PC, sua mira e seu setup com uma pegada mais competitiva.</p></div><div className="space-y-12">{products.map((p,i)=><Product key={p.title} {...p} right={i%2===1}/>)}</div></section><Testimonials/><section id="planos" className="relative z-10 max-w-7xl mx-auto px-6 py-20"><div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10"><div><p className="text-vks-red font-black tracking-widest">PROMOÇÃO ATIVA</p><h2 className="text-5xl font-black">Planos com desconto</h2><p className="text-zinc-400 mt-3">Valores promocionais para as primeiras ativações. Garanta sua key vitalícia.</p></div><span className="rounded-full border border-red-500/35 bg-red-500/10 px-5 py-3 text-vks-red font-black glow">⚠️ Estoque de keys limitado</span></div><div className="grid lg:grid-cols-3 gap-6">{plans.map(p=><div className="relative rounded-[2rem] bg-black/65 border border-red-500/30 p-8 glow-strong overflow-hidden" key={p[0]}><div className="absolute right-5 top-5 rounded-full bg-vks-red px-3 py-1 text-xs font-black">VITALÍCIO</div><h3 className="text-3xl font-black text-vks-red pr-24">{p[0]}</h3><p className="mt-5 text-lg price-old">De R$ {p[1]}</p><p className="text-5xl font-black my-2">R$ {p[2]}</p><p className="text-sm text-zinc-400 mb-6">Pagamento único • Sem mensalidade</p><ul className="space-y-3 text-zinc-300">{p[3].map(i=><li key={i}>✓ {i}</li>)}</ul><button className="mt-8 w-full rounded-2xl bg-vks-red py-4 font-black text-lg shadow-[0_0_30px_rgba(255,23,61,.45)] hover:scale-[1.03] transition">Comprar agora e ativar key</button><p className="mt-4 text-center text-xs text-zinc-500">Liberação automática após aprovação do pagamento</p></div>)}</div></section><FAQ/><Footer/></main>}

function HeroVideo(){return <div className="absolute inset-0 overflow-hidden" aria-hidden="true"><video className="hero-local-video" src="/videos/hero.mp4" autoPlay muted loop playsInline preload="metadata"/><div className="hero-video-overlay"/><div className="hero-scanline"/></div>}

function Header(){return <nav className="relative z-20 border-b border-red-500/10 bg-black/45 backdrop-blur-xl"><div className="mx-auto max-w-7xl grid grid-cols-3 items-center px-6 py-4"><div/><a href="/" className="justify-self-center inline-flex items-center gap-3"><Image src="/images/mascote-vks.png" alt="Logo VKS BOOST" width={54} height={54} className="h-12 w-12 object-contain drop-shadow-[0_0_18px_rgba(255,23,61,.75)]"/><b className="text-2xl md:text-3xl brand-title"><span className="text-vks-red">VKS</span> <span className="text-white">BOOST</span></b></a><div className="justify-self-end flex gap-4"><a className="hover:text-vks-red" href="/login">Login</a><a className="rounded-full bg-vks-red px-5 py-2 font-black text-white shadow-[0_0_24px_rgba(255,23,61,.45)] hover:scale-105 transition" href="/register">Criar conta</a></div></div></nav>}

function Product({title,tag,text,bullets,image,right}:{title:string;tag:string;text:string;bullets:string[];image:string;right?:boolean}){return <div className={`grid md:grid-cols-2 gap-8 items-center ${right?'md:[&>*:first-child]:order-2':''}`}><div className="rounded-[2rem] bg-black/60 border border-red-500/25 p-8 glow-strong"><p className="text-vks-red text-sm font-black tracking-widest">{tag}</p><h3 className="text-4xl font-black text-white mt-3"><span className="text-vks-red">{title.split(' ')[0]} {title.split(' ')[1]}</span> {title.split(' ').slice(2).join(' ')}</h3><p className="text-zinc-300 text-lg mt-5 leading-relaxed">{text}</p><div className="grid sm:grid-cols-2 gap-3 mt-6">{bullets.map(b=><span className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm" key={b}>✓ {b}</span>)}</div></div><div className="preview-card group relative h-80 md:h-[360px] rounded-[2rem] border border-red-500/30 overflow-hidden glow"><Image src={image} alt={`Preview do ${title}`} fill className="object-cover object-top transition duration-500 group-hover:scale-[1.03]" sizes="(max-width:768px) 100vw, 50vw"/><div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"/><div className="absolute left-5 bottom-5 right-5"><p className="text-xs text-vks-red font-black tracking-widest">PREVIEW OFICIAL</p><p className="text-xl font-black">{title}</p></div></div></div>}

function Testimonials(){const list=[...testimonials,...testimonials];return <section className="relative z-10 px-6 py-20 overflow-hidden"><div className="max-w-7xl mx-auto mb-8"><p className="text-vks-red font-black tracking-widest">VALIDAÇÕES REAIS</p><h2 className="text-5xl font-black">Resultados dos clientes</h2></div><div className="testimonial-track">{list.map((t,i)=><div className="w-[360px] rounded-[1.7rem] bg-black/65 border border-red-500/25 p-6 glow" key={`${t[1]}-${i}`}><p className="text-yellow-400 tracking-widest">★★★★★</p><p className="text-zinc-300 my-4 min-h-20">“{t[0]}”</p><b>{t[1]}</b><p className="text-vks-red text-sm font-bold">Usado em {t[2]}</p></div>)}</div></section>}

function FAQ(){return <section className="relative z-10 max-w-5xl mx-auto px-6 py-16"><h2 className="text-4xl font-black mb-8">FAQ</h2>{[['O que acontece depois da compra?','Após o pagamento aprovado, sua key é liberada automaticamente na sua conta.'],['Como o app sabe qual key está ativa?','O aplicativo consulta sua conta e identifica se a key ativa é do VKS Boost Optimizer, VKS Precission FIX ou VKS Crosshair.'],['Posso ter os três aplicativos?','Sim, cada produto possui sua própria key e pode ser ativado separadamente.'],['O pagamento é automático?','Sim, o pagamento via Mercado Pago libera a key automaticamente após aprovação.']].map(f=><details className="rounded-2xl bg-black/60 border border-red-500/20 p-5 mb-3 glow" key={f[0]}><summary className="font-bold cursor-pointer">{f[0]}</summary><p className="text-zinc-300 mt-3">{f[1]}</p></details>)}</section>}

function Footer(){return <footer className="relative z-10 border-t border-red-500/10 bg-black/55"><div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-zinc-400"><div className="flex items-center gap-3"><Image src="/images/mascote-vks.png" alt="VKS BOOST" width={44} height={44} className="h-10 w-10 object-contain"/><span>© 2026 VKS BOOST — performance, otimização, cupons e ativação premium.</span></div><div className="flex gap-4 text-sm"><a href="/login" className="hover:text-vks-red">Login</a><a href="/register" className="hover:text-vks-red">Criar conta</a><a href="#planos" className="hover:text-vks-red">Planos</a></div></div></footer>}
