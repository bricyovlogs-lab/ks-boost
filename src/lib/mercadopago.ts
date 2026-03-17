export type MercadoPagoPreferenceResponse = {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
};

export type MercadoPagoPaymentResponse = {
  id: number;
  status: string;
  external_reference?: string | null;
  payer?: {
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  };
  metadata?: Record<string, unknown> | null;
  transaction_amount?: number;
  currency_id?: string;
  date_approved?: string | null;
  additional_info?: {
    items?: Array<{
      id?: string;
      title?: string;
      unit_price?: number;
      quantity?: number;
    }>;
  };
};

function getAccessToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado no .env.");
  return token;
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function createMercadoPagoPreference(input: {
  title: string;
  unitPrice: number;
  quantity: number;
  payerEmail: string;
  payerName?: string;
  itemId: string;
  externalReference: string;
  notificationUrl: string;
  metadata: Record<string, unknown>;
}) {
  const appUrl = getAppUrl();
  const isLocalhost = appUrl.includes("localhost") || appUrl.includes("127.0.0.1");

  const payload: Record<string, unknown> = {
    items: [
      {
        id: input.itemId,
        title: input.title,
        quantity: input.quantity,
        currency_id: "BRL",
        unit_price: input.unitPrice,
      },
    ],
    payer: {
      email: input.payerEmail,
      ...(input.payerName ? { name: input.payerName } : {}),
    },
    metadata: input.metadata,
    external_reference: input.externalReference,
    notification_url: input.notificationUrl,
  };

  // Para teste local o Mercado Pago costuma recusar auto_return/back_urls com localhost.
  // Então só envia isso quando a app URL for pública.
  if (!isLocalhost) {
    payload.back_urls = {
      success: `${appUrl}/success`,
      failure: `${appUrl}/cancel`,
      pending: `${appUrl}/success`,
    };
    payload.auto_return = "approved";
  }

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Mercado Pago create preference failed: ${response.status} ${body}`);
  }

  return (await response.json()) as MercadoPagoPreferenceResponse;
}

export async function getMercadoPagoPayment(paymentId: string | number) {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      "Authorization": `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Mercado Pago get payment failed: ${response.status} ${body}`);
  }

  return (await response.json()) as MercadoPagoPaymentResponse;
}

export function getMercadoPagoWebhookSecret() {
  return process.env.MERCADOPAGO_WEBHOOK_SECRET || "";
}
