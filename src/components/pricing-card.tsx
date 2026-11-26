"use client";

import { LICENSE_PLAN_CONFIG, STORE_PLAN_FEATURES, type StorePlan } from "@/lib/constants";
import { formatBRL } from "@/lib/utils";

type Props = {
  plan: StorePlan;
  featured?: boolean;
};

export function PricingCard({ plan, featured = false }: Props) {
  const config = LICENSE_PLAN_CONFIG[plan];
  const features = STORE_PLAN_FEATURES[plan];

  const openModal = () => {
    window.dispatchEvent(new CustomEvent("open-purchase-modal", { detail: { plan } }));
  };

  return (
    <div className={`vx-plan ${featured ? "is-featured" : ""}`}>
      <div className="vx-plan-tags">
        {featured ? <span className="vx-plan-hot">Mais vendido</span> : <span />}
        <span className="vx-plan-tag">Vitalício</span>
      </div>
      <h3 className="vx-plan-name">{config.label}</h3>
      {config.oldAmount ? <div className="vx-plan-old">De {formatBRL(config.oldAmount)}</div> : null}
      <div className="vx-plan-price">{formatBRL(config.amount)}</div>
      <div className="vx-plan-once">Pagamento único · Sem mensalidade</div>
      <ul className="vx-plan-list">
        {features.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button className="vx-btn vx-btn--red vx-plan-buy" type="button" onClick={openModal}>
        Comprar agora e ativar key
      </button>
      <div className="vx-plan-foot">Liberação automática após aprovação do pagamento</div>
    </div>
  );
}
