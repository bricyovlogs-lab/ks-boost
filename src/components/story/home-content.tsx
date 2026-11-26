"use client";

import { PricingCard } from "@/components/pricing-card";
import { PurchaseModal } from "@/components/purchase-modal";
import { FaqAccordion } from "@/components/faq-accordion";
import { StoryExperience } from "@/components/story/story-experience";

const testimonials = [
  {
    name: "Matheus R.",
    role: "Jogador de Valorant",
    text: "Meu PC estava muito instável no Valorant. Depois que apliquei as otimizações do VKS BOOST, saí de uma média de 100 FPS para 210 FPS em várias partidas, com muito menos travadas e bem mais fluidez.",
  },
  {
    name: "João P.",
    role: "Player de FiveM",
    text: "No FiveM eu sofria com queda de FPS e input lag. Depois de usar o app, o jogo ficou muito mais liso e meu FPS subiu de cerca de 75 para 150. Mudou totalmente a sensação de jogar.",
  },
  {
    name: "Carlos H.",
    role: "Cliente com PC de entrada",
    text: "Achei que não ia fazer tanta diferença, mas ajudou demais. O Windows ficou mais leve, os jogos abriram mais rápido e no CS2 eu saí de 90 para 165 FPS em vários momentos. Valeu muito a pena.",
  },
];

export function HomeContent({ fontClassName }: { fontClassName: string }) {
  const openPurchase = (plan: "BOOST_OPTIMIZER" | "BOOST_GPU" | "WINDOWS_LITE" = "BOOST_GPU") => {
    window.dispatchEvent(new CustomEvent("open-purchase-modal", { detail: { plan } }));
  };

  return (
    <div className={`vx-page ${fontClassName}`}>
      <PurchaseModal />

      <StoryExperience onBuy={() => openPurchase("BOOST_GPU")} />

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
            <PricingCard plan="BOOST_OPTIMIZER" />
            <PricingCard plan="BOOST_GPU" featured />
            <PricingCard plan="WINDOWS_LITE" />
          </div>
        </div>
      </section>

      <section className="vx-section" id="beneficios">
        <div className="vx-inner">
          <div className="vx-head">
            <div>
              <div className="vx-eyebrow">Depoimentos</div>
              <h2 className="vx-title">Quem usa, <em>sente.</em></h2>
            </div>
          </div>
          <div className="vx-quotes">
            {testimonials.map((item) => (
              <div className="vx-quote" key={item.name}>
                <div className="vx-stars">★★★★★</div>
                <p>{item.text}</p>
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="vx-section vx-faq" id="faq">
        <div className="vx-inner">
          <div className="vx-head">
            <div>
              <div className="vx-eyebrow">FAQ</div>
              <h2 className="vx-title">Perguntas <em>frequentes.</em></h2>
            </div>
          </div>
          <FaqAccordion />
        </div>
      </section>

      <footer className="vx-footer">
        <div className="vx-inner">
          <span>© {new Date().getFullYear()} VKS BOOST</span>
          <span>Performance · otimização · cupons e ativação premium</span>
        </div>
      </footer>
    </div>
  );
}
