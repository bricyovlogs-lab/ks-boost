"use client";

import { LicensePlan } from "@prisma/client";
import { LICENSE_PLAN_CONFIG } from "@/lib/constants";
import { formatBRL } from "@/lib/utils";

type Props = {
  plan: LicensePlan;
  featured?: boolean;
};

const PLAN_EXTRAS: Record<LicensePlan, string[]> = {
  DAYS_30: [
    "Ideal para começar",
    "Entrega automática da key",
    "Validação segura no app",
    "Download oficial liberado",
  ],
  DAYS_90: [
    "Melhor custo-benefício",
    "Plano mais vendido",
    "Mais tempo de uso",
    "Suporte ao licenciamento",
  ],
  LIFETIME: [
    "Key vitalícia",
    "Pagamento único",
    "Licença sem expiração",
    "Melhor opção definitiva",
  ],
};

export function PricingCard({ plan, featured = false }: Props) {
  const config = LICENSE_PLAN_CONFIG[plan];
  const extras = PLAN_EXTRAS[plan];

  const openModal = () => {
    window.dispatchEvent(new CustomEvent("open-purchase-modal", { detail: { plan } }));
  };

  return (
    <div className={`card plan-card highlight-card reveal ${featured ? "featured" : ""}`}>
      {featured ? <div className="badge">Mais vendido</div> : null}
      {!featured && plan === "LIFETIME" ? <div className="badge">Key vitalícia</div> : null}

      <h3>{config.label}</h3>
      <div className={`price ${plan === "LIFETIME" ? "lifetime-glow" : ""}`}>{formatBRL(config.amount)}</div>
      <p className="muted">
        {config.isLifetime
          ? "Licença permanente para quem quer comprar uma vez e usar sem prazo."
          : `Licença oficial do VKS BOOST com validade de ${config.durationDays} dias.`}
      </p>

      <div className="soft-divider" />

      <ul className="list">
        {extras.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <p className="plan-note">
        {plan === "DAYS_90"
          ? "Recomendado para quem quer mais tempo pagando menos por mês."
          : plan === "LIFETIME"
          ? "A opção definitiva para não depender de renovação."
          : "Perfeito para testar tudo que o app entrega."}
      </p>

      <button className="primary-button" style={{ marginTop: 20 }} type="button" onClick={openModal}>
        {plan === "LIFETIME" ? "Comprar key vitalícia" : "Comprar agora"}
      </button>
    </div>
  );
}
