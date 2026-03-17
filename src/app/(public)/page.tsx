"use client";

import { PricingCard } from "@/components/pricing-card";
import { PurchaseModal } from "@/components/purchase-modal";
import { AnimatedCounter } from "@/components/animated-counter";
import { FaqAccordion } from "@/components/faq-accordion";

function Particles({ count = 30 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => {
        const left = (index * 37) % 100;
        const duration = 9 + (index % 8);
        const delay = (index % 9) * 0.8;
        const size = 2 + (index % 2);
        return (
          <span
            key={index}
            className="particle"
            style={{
              left: `${left}%`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              width: `${size}px`,
              height: `${size}px`,
            }}
          />
        );
      })}
    </>
  );
}

const featureCards = [
  {
    icon: "⚡",
    title: "Boost de desempenho",
    text: "Aplique otimizações rápidas para deixar o Windows mais leve, responsivo e pronto para jogos.",
  },
  {
    icon: "🧠",
    title: "Analyze System",
    text: "Analisa CPU, RAM e processos em tempo real para identificar gargalos e sugerir ajustes.",
  },
  {
    icon: "🧹",
    title: "Cleaner e Memory",
    text: "Limpeza e alívio de memória para reduzir excesso de processos e melhorar a fluidez.",
  },
  {
    icon: "🎯",
    title: "Boost Ping e FPS",
    text: "Ajustes para foco em estabilidade, menor atraso e melhor sensação dentro do game.",
  },
];

const reasons = [
  "Seu PC tende a acumular processos, serviços e excesso de carga com o tempo.",
  "Quem joga quer resposta rápida, sistema limpo e menos gargalo na hora que importa.",
  "A key vitalícia evita renovação e já libera o uso definitivo do aplicativo.",
  "O VKS BOOST reúne tudo em um painel premium, fácil de usar e direto ao ponto.",
];

const testimonials = [
  {
    name: "Lucas M.",
    role: "Jogador competitivo",
    text: "O visual passou muito mais confiança e o app ficou com cara de produto premium. A apresentação vende muito melhor agora.",
  },
  {
    name: "Rafael G.",
    role: "Cliente recorrente",
    text: "A ideia de key vitalícia e o destaque do plano de 90 dias ficou perfeita. O site agora parece software profissional de verdade.",
  },
  {
    name: "André V.",
    role: "Entusiasta de performance",
    text: "O mockup do painel e a proposta de otimização deixam claro o valor do aplicativo logo de cara. Ficou muito mais forte para conversão.",
  },
];

export default function HomePage() {
  const openPurchase = (plan: "DAYS_30" | "DAYS_90" | "LIFETIME" = "DAYS_90") => {
    window.dispatchEvent(new CustomEvent("open-purchase-modal", { detail: { plan } }));
  };

  return (
    <>
      <PurchaseModal />

      <section className="hero">
        <div className="hero-particles">
          <Particles count={44} />
        </div>

        <div className="container hero-grid">
          <div className="prime-copy">
            <div className="top-banner reveal">
              <span className="top-banner-dot" />
              Otimização premium para Windows com ativação por key
            </div>

            <div className="hero-kicker reveal reveal-delay-1">Performance suite premium para Windows</div>

            <h1 className="reveal reveal-delay-1">
              Faça seu PC entregar <span className="hero-highlight">mais desempenho</span>,{" "}
              <span className="hero-highlight">mais fluidez</span> e uma experiência muito mais limpa.
            </h1>

            <p className="reveal reveal-delay-2">
              O VKS BOOST foi criado para quem quer otimizar o Windows com visual premium, ações rápidas,
              análise de gargalo e um painel moderno focado em performance real.
            </p>

            <div className="cta-strip reveal reveal-delay-2">
              <button className="primary-button" onClick={() => openPurchase("DAYS_90")}>
                Comprar agora
              </button>
              <a href="#recursos" className="secondary-button">Ver recursos do app</a>
            </div>

            <div className="buy-now-strip reveal reveal-delay-3">
              <strong>Plano mais vendido:</strong> 90 dias por R$ 65,00 &nbsp;•&nbsp; <strong>Opção definitiva:</strong> key vitalícia por R$ 99,90
            </div>

            <div className="hero-metrics">
              <div className="metric-card reveal reveal-delay-1">
                <div className="metric-value"><AnimatedCounter value={30} /> / <AnimatedCounter value={90} /></div>
                <div className="metric-label">Planos temporários</div>
              </div>
              <div className="metric-card reveal reveal-delay-2">
                <div className="metric-value">1 key</div>
                <div className="metric-label">Ativação segura</div>
              </div>
              <div className="metric-card reveal reveal-delay-3">
                <div className="metric-value"><AnimatedCounter value={100} suffix="%" /></div>
                <div className="metric-label">Visual premium gamer</div>
              </div>
            </div>
          </div>

          <div className="hero-visual reveal reveal-delay-2">
            <div className="section-particles">
              <Particles count={26} />
            </div>

            <div className="preview-wrap">
              <img src="/images/dashboard-preview.png" alt="Painel do aplicativo VKS BOOST" />
            </div>

            <div className="preview-caption">
              <h3 style={{ margin: 0 }}>Mockup 3D do painel do VKS BOOST</h3>
              <p className="muted" style={{ margin: 0 }}>
                Um dashboard mais profissional, com módulos para análise, limpeza, ping, memória e ações rápidas.
              </p>
              <div className="preview-pills">
                <span className="preview-pill">Analyze System</span>
                <span className="preview-pill">Memory</span>
                <span className="preview-pill">Cleaner</span>
                <span className="preview-pill">Boost Ping</span>
                <span className="preview-pill">Tweaks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="recursos">
        <div className="container">
          <h2 className="section-title reveal">O que você encontra no VKS BOOST</h2>
          <p className="section-subtitle reveal reveal-delay-1">
            Um painel completo para analisar o PC, aplicar otimizações e manter o sistema com mais performance no dia a dia e nos jogos.
          </p>
          <div className="grid-4">
            {featureCards.map((item, index) => (
              <div className={`card highlight-card reveal reveal-delay-${Math.min(index, 3)}`} key={item.title}>
                <div className="feature-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p className="muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="comprar-agora">
        <div className="container">
          <h2 className="section-title reveal">Por que comprar agora</h2>
          <p className="section-subtitle reveal reveal-delay-1">
            Se a ideia é deixar o PC mais preparado para uso pesado e jogos, quanto antes você aplicar as otimizações, antes sente a diferença.
          </p>
          <div className="grid-2">
            <div className="card reveal reveal-delay-1">
              <h3>Vantagem imediata</h3>
              <ul className="list">
                {reasons.slice(0, 2).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div className="card reveal reveal-delay-2">
              <h3>Melhor custo para quem quer resultado</h3>
              <ul className="list">
                {reasons.slice(2).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="comparacao-planos">
        <div className="container">
          <h2 className="section-title reveal">Comparação entre planos</h2>
          <p className="section-subtitle reveal reveal-delay-1">
            Veja rapidamente qual licença faz mais sentido para seu tipo de uso.
          </p>
          <div className="table-wrap reveal reveal-delay-1">
            <table className="table">
              <thead>
                <tr>
                  <th>Recurso</th>
                  <th>30 dias</th>
                  <th>90 dias</th>
                  <th>Vitalícia</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Preço</td>
                  <td>R$ 35,00</td>
                  <td>R$ 65,00</td>
                  <td>R$ 99,90</td>
                </tr>
                <tr>
                  <td>Validade</td>
                  <td>30 dias</td>
                  <td>90 dias</td>
                  <td>Sem expiração</td>
                </tr>
                <tr>
                  <td>Melhor custo-benefício</td>
                  <td>—</td>
                  <td>✔</td>
                  <td>✔</td>
                </tr>
                <tr>
                  <td>Sem renovação</td>
                  <td>—</td>
                  <td>—</td>
                  <td>✔</td>
                </tr>
                <tr>
                  <td>Ideal para</td>
                  <td>Testar</td>
                  <td>Uso recorrente</td>
                  <td>Uso definitivo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" id="antes-depois">
        <div className="container">
          <h2 className="section-title reveal">Antes e depois do PC</h2>
          <p className="section-subtitle reveal reveal-delay-1">
            Uma forma simples de mostrar o que o cliente busca: menos peso no sistema e uma sensação de mais controle e fluidez.
          </p>

          <div className="before-after-grid">
            <div className="card before-card reveal">
              <div className="before-label">Antes</div>
              <h3>Windows pesado e cheio de excesso</h3>
              <div className="stat-line"><span>Processos acumulados</span><strong>158</strong></div>
              <div className="stat-line"><span>Memória ocupada</span><strong>11,8 GB</strong></div>
              <div className="stat-line"><span>Sensação no uso</span><strong>Travando</strong></div>
              <div className="stat-line"><span>Tempo de resposta</span><strong>Lento</strong></div>
            </div>

            <div className="card after-card reveal reveal-delay-1">
              <div className="after-label">Depois</div>
              <h3>Sistema mais limpo e preparado</h3>
              <div className="stat-line"><span>Processos otimizados</span><strong>Menos carga</strong></div>
              <div className="stat-line"><span>Memória melhor gerida</span><strong>Mais folga</strong></div>
              <div className="stat-line"><span>Sensação no uso</span><strong>Mais fluida</strong></div>
              <div className="stat-line"><span>Tempo de resposta</span><strong>Mais rápido</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="autoridade">
        <div className="container">
          <h2 className="section-title reveal">Autoridade e confiança</h2>
          <p className="section-subtitle reveal reveal-delay-1">
            Uma página mais forte precisa passar sensação de produto real, premium e confiável. Por isso essa versão também ganhou uma seção de prova social.
          </p>

          <div className="testimonial-grid">
            {testimonials.map((item, index) => (
              <div className={`card reveal reveal-delay-${Math.min(index, 3)}`} key={item.name}>
                <div className="stars">★★★★★</div>
                <p>{item.text}</p>
                <div style={{ marginTop: 18 }}>
                  <div className="testimonial-name">{item.name}</div>
                  <div className="testimonial-role">{item.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="beneficios">
        <div className="container">
          <h2 className="section-title reveal">Feito para quem quer resultado</h2>
          <p className="section-subtitle reveal reveal-delay-1">
            O VKS BOOST reúne análise, limpeza, ajustes rápidos e ativação por key em uma experiência premium, direta e profissional.
          </p>
          <div className="grid-3">
            <div className="card highlight-card reveal">
              <div className="feature-icon">🔥</div>
              <h3>Mais performance</h3>
              <p className="muted">Menos processos desnecessários, mais foco no que realmente importa durante o uso e nos jogos.</p>
            </div>
            <div className="card highlight-card reveal reveal-delay-1">
              <div className="feature-icon">🛡️</div>
              <h3>Licença segura</h3>
              <p className="muted">Sistema com key, validação automática e suporte a ativação por dispositivo.</p>
            </div>
            <div className="card highlight-card reveal reveal-delay-2">
              <div className="feature-icon">🚀</div>
              <h3>Visual premium</h3>
              <p className="muted">Painel moderno com identidade gamer, leitura clara e ações rápidas em destaque.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="planos">
        <div className="container">
          <h2 className="section-title reveal">Escolha sua licença</h2>
          <p className="section-subtitle reveal reveal-delay-1">
            Compre sua key oficial do VKS BOOST e libere todos os recursos do aplicativo.
          </p>
          <div className="grid-3">
            <PricingCard plan="DAYS_30" />
            <PricingCard plan="DAYS_90" featured />
            <PricingCard plan="LIFETIME" />
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="container">
          <h2 className="section-title reveal">Perguntas frequentes</h2>
          <div className="reveal reveal-delay-1">
            <FaqAccordion />
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">© {new Date().getFullYear()} VKS BOOST — performance, otimização, cupons e ativação premium.</div>
      </footer>
    </>
  );
}
