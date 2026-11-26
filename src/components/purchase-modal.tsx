"use client";

import { useEffect, useMemo, useState } from "react";
import { LICENSE_PLAN_CONFIG, STORE_PLANS, type StorePlan } from "@/lib/constants";
import { formatBRL } from "@/lib/utils";

type Props = {
  defaultPlan?: StorePlan;
};

const planDesc: Record<StorePlan, string> = {
  BOOST_OPTIMIZER: "Otimizador completo, licença vitalícia.",
  BOOST_GPU: "Otimizador + ajustes da placa de vídeo. Mais vendido.",
  WINDOWS_LITE: "Windows mais leve, licença vitalícia.",
};

const planOptions = STORE_PLANS.map((value) => ({
  value,
  label: LICENSE_PLAN_CONFIG[value].label,
  price: formatBRL(LICENSE_PLAN_CONFIG[value].amount),
  desc: planDesc[value],
}));

export function PurchaseModal({ defaultPlan = "BOOST_GPU" }: Props) {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState(defaultPlan);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const openModal = (event: Event) => {
      const custom = event as CustomEvent<{ plan?: typeof defaultPlan }>;
      setPlan((STORE_PLANS as readonly string[]).includes(custom.detail?.plan ?? "") ? (custom.detail!.plan as StorePlan) : defaultPlan);
      setOpen(true);
      setErrorMessage("");
    };

    window.addEventListener("open-purchase-modal", openModal as EventListener);
    return () => window.removeEventListener("open-purchase-modal", openModal as EventListener);
  }, [defaultPlan]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading]);

  const selected = useMemo(
    () => planOptions.find((item) => item.value === plan) ?? planOptions[0],
    [plan]
  );

  async function handleCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          plan,
          couponCode,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível iniciar o checkout.");
      }

      if (!data?.url) {
        throw new Error("O Mercado Pago não retornou a URL do checkout.");
      }

      window.location.href = data.url;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao iniciar o checkout.");
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={() => !loading && setOpen(false)}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-grid">
          <div>
            <div className="badge">Checkout oficial</div>
            <h2 style={{ marginTop: 0 }}>Comprar sua key do VKS BOOST</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              Escolha o plano, preencha seus dados e siga para o pagamento seguro. A key é enviada automaticamente após a aprovação.
            </p>

            <div className="modal-plan-preview">
              <div className="muted">Plano selecionado</div>
              <div className="modal-plan-title">{selected.label}</div>
              <div className="modal-plan-price">{selected.price}</div>
              <p className="muted" style={{ marginBottom: 0 }}>{selected.desc}</p>
            </div>

            <ul className="list" style={{ marginTop: 18 }}>
              <li>Pagamento seguro via Mercado Pago</li>
              <li>Entrega automática da licença</li>
              <li>Ativação por key no aplicativo</li>
              <li>Campo para cupom de desconto e atribuição de influenciador</li>
            </ul>
          </div>

          <form className="form" onSubmit={handleCheckout}>
            <div className="field">
              <label>Nome</label>
              <input
                className="input"
                name="name"
                type="text"
                placeholder="Seu nome"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Email</label>
              <input
                className="input"
                name="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Plano</label>
              <select
                className="input"
                name="plan"
                value={plan}
                onChange={(e) => setPlan(e.target.value as typeof defaultPlan)}
              >
                {planOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} — {option.price}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Cupom de desconto</label>
              <input
                className="input"
                name="couponCode"
                type="text"
                placeholder="Ex: VKS10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
            </div>

            {errorMessage ? (
              <div className="error-box" style={{ marginTop: 10 }}>
                {errorMessage}
              </div>
            ) : null}

            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setOpen(false)} disabled={loading}>
                Fechar
              </button>
              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? "Abrindo checkout..." : "Ir para o checkout"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
