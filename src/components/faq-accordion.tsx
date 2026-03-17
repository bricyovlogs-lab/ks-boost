"use client";

import { useState } from "react";

const items = [
  {
    q: "O que acontece depois da compra?",
    a: "Após a confirmação do pagamento, a key é gerada e enviada automaticamente para o email do cliente.",
  },
  {
    q: "A licença vitalícia expira?",
    a: "Não. A key vitalícia é permanente e não depende de renovação.",
  },
  {
    q: "Posso usar cupom de influencer ou revendedor?",
    a: "Sim. O checkout já aceita cupom e o sistema pode atribuir comissão para influencer ou revendedor dono do código.",
  },
  {
    q: "O aplicativo tem painel como o da imagem?",
    a: "Sim. O site já mostra uma prévia real do dashboard do VKS BOOST para reforçar a apresentação do produto.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="card">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={item.q} className="faq-item">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              style={{
                width: "100%",
                background: "transparent",
                color: "white",
                border: "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 0,
                cursor: "pointer",
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              <span>{item.q}</span>
              <span style={{ color: "#ff6868" }}>{open ? "−" : "+"}</span>
            </button>
            <div
              style={{
                display: "grid",
                gridTemplateRows: open ? "1fr" : "0fr",
                transition: "grid-template-rows .28s ease",
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <p className="muted" style={{ marginBottom: 0, paddingTop: open ? 12 : 0 }}>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
