export async function sendDiscordWebhook(url: string | undefined, payload: { content?: string; embeds?: unknown[] }) {
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Falha ao enviar webhook do Discord:", error);
  }
}

export async function notifyApprovedSale(params: {
  email: string;
  plan: string;
  amountCents: number;
  couponCode?: string | null;
}) {
  await sendDiscordWebhook(process.env.DISCORD_WEBHOOK_SALES, {
    embeds: [
      {
        title: "✅ Venda aprovada",
        color: 0xff2b2b,
        fields: [
          { name: "Cliente", value: params.email, inline: true },
          { name: "Plano", value: params.plan, inline: true },
          { name: "Valor", value: `R$ ${(params.amountCents / 100).toFixed(2)}`, inline: true },
          { name: "Cupom", value: params.couponCode || "Sem cupom", inline: true },
        ],
      },
    ],
  });
}

export async function notifyPayoutRequest(params: {
  partnerEmail: string;
  amountCents: number;
  pixName: string;
  pixKey: string;
}) {
  await sendDiscordWebhook(process.env.DISCORD_WEBHOOK_PAYOUTS, {
    embeds: [
      {
        title: "💸 Solicitação de saque",
        color: 0xff2b2b,
        fields: [
          { name: "Parceiro", value: params.partnerEmail, inline: true },
          { name: "Valor", value: `R$ ${(params.amountCents / 100).toFixed(2)}`, inline: true },
          { name: "Nome PIX", value: params.pixName, inline: false },
          { name: "Chave PIX", value: params.pixKey, inline: false },
        ],
      },
    ],
  });
}
