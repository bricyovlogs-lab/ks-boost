type PurchaseEmailParams = {
  customerName?: string | null;
  keyValue: string;
  planLabel: string;
  expiresAt: Date | null;
  downloadUrl: string;
};

export function buildPurchaseEmailHtml(params: PurchaseEmailParams) {
  const greeting = params.customerName ? `Olá, ${params.customerName}!` : "Olá!";
  const expiry = params.expiresAt
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(params.expiresAt)
    : "Vitalícia";

  return `
  <div style="background:#0b0b0c;padding:32px;font-family:Arial,sans-serif;color:#f5f5f5">
    <div style="max-width:640px;margin:0 auto;background:#121214;border:1px solid #2a2a2e;border-radius:16px;padding:32px">
      <h1 style="margin:0 0 12px;color:#ff2b2b">VKS BOOST</h1>
      <p style="font-size:16px">${greeting}</p>
      <p>Seu pagamento foi aprovado e sua licença já foi gerada com sucesso.</p>
      <div style="background:#1a1a1f;border-radius:12px;padding:20px;margin:24px 0">
        <p style="margin:0 0 8px;color:#bdbdbd">Sua key:</p>
        <p style="font-size:24px;font-weight:700;letter-spacing:1px;margin:0;color:#ffffff">${params.keyValue}</p>
      </div>
      <p><strong>Plano:</strong> ${params.planLabel}</p>
      <p><strong>Validade:</strong> ${expiry}</p>
      <p style="margin-top:24px"><strong>Como ativar:</strong></p>
      <ol style="line-height:1.7">
        <li>Baixe o aplicativo no link abaixo</li>
        <li>Abra o VKS BOOST</li>
        <li>Cole sua key</li>
        <li>Conclua a ativação</li>
      </ol>
      <p style="margin-top:24px">
        <a href="${params.downloadUrl}" style="display:inline-block;background:#ff2b2b;color:#fff;text-decoration:none;padding:14px 20px;border-radius:10px;font-weight:700">Baixar aplicativo</a>
      </p>
    </div>
  </div>
  `;
}
