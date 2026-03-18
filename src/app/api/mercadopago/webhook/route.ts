import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { MERCADOPAGO_ITEM_ID_TO_PLAN } from "@/lib/constants";
import { getMercadoPagoPayment, getMercadoPagoWebhookSecret } from "@/lib/mercadopago";
import {
  createLicenseFromPayment,
  finalizeAffiliateCredit,
  registerPayment,
} from "@/modules/licenses/license.service";
import { sendPurchaseEmail } from "@/modules/email/email.service";
import { notifyApprovedSale } from "@/lib/discord";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseSignature(signature: string) {
  return Object.fromEntries(
    signature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key?.trim(), value?.trim()];
    }),
  ) as Record<string, string>;
}

function maybeValidateSignature(request: NextRequest, dataId: string) {
  const secret = getMercadoPagoWebhookSecret();
  if (!secret) return true;

  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id") || "";
  const url = new URL(request.url);
  const dataIdFromUrl = url.searchParams.get("data.id") || url.searchParams.get("id") || dataId || "";

  if (!signature || !requestId || !dataIdFromUrl) {
    return false;
  }

  const parsed = parseSignature(signature);
  const ts = parsed.ts || "";
  const v1 = parsed.v1 || "";

  if (!ts || !v1) {
    return false;
  }

  const manifest = `id:${dataIdFromUrl};request-id:${requestId};ts:${ts};`;
  const digest = createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(v1));
  } catch {
    return false;
  }
}

function getTopic(url: URL, body: any) {
  return (
    url.searchParams.get("topic") ||
    url.searchParams.get("type") ||
    body?.type ||
    body?.topic ||
    body?.action ||
    ""
  );
}

function getDataId(url: URL, body: any) {
  return (
    url.searchParams.get("data.id") ||
    url.searchParams.get("id") ||
    body?.data?.id ||
    body?.resource?.id ||
    body?.id ||
    ""
  );
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const body = await request.json().catch(() => ({}));

  const topic = String(getTopic(url, body));
  const dataId = String(getDataId(url, body));

  console.log("[MP WEBHOOK] body:", JSON.stringify(body));
  console.log("[MP WEBHOOK] topic:", topic, "dataId:", dataId);

  if (!dataId) {
    return NextResponse.json({ received: true, ignored: "missing_id" });
  }

  if (!maybeValidateSignature(request, dataId)) {
    console.error("[MP WEBHOOK] assinatura inválida");
    return NextResponse.json({ error: "Assinatura inválida do Mercado Pago." }, { status: 401 });
  }

  const normalizedTopic = topic.toLowerCase();

  if (
    normalizedTopic !== "payment" &&
    normalizedTopic !== "payments" &&
    normalizedTopic !== "payment.created" &&
    normalizedTopic !== "payment.updated"
  ) {
    return NextResponse.json({ received: true, ignored: normalizedTopic || "unknown_topic" });
  }

  try {
    const paymentDetails = await getMercadoPagoPayment(dataId);

    console.log(
      "[MP WEBHOOK] payment:",
      JSON.stringify({
        id: paymentDetails.id,
        status: paymentDetails.status,
        external_reference: paymentDetails.external_reference,
        metadata: paymentDetails.metadata,
      }),
    );

    if (paymentDetails.status !== "approved") {
      return NextResponse.json({
        received: true,
        ignored: paymentDetails.status || "not_approved",
      });
    }

    const metadata = paymentDetails.metadata || {};
    const itemId = String(metadata.itemId || paymentDetails.additional_info?.items?.[0]?.id || "");
    const plan = MERCADOPAGO_ITEM_ID_TO_PLAN[itemId];

    if (!plan) {
      console.error("[MP WEBHOOK] plano não reconhecido. itemId:", itemId);
      return NextResponse.json(
        { error: "Plano não reconhecido no pagamento do Mercado Pago." },
        { status: 400 },
      );
    }

    const email = String(metadata.customerEmail || paymentDetails.payer?.email || "");
    if (!email) {
      console.error("[MP WEBHOOK] email não encontrado");
      return NextResponse.json(
        { error: "Email não encontrado no pagamento do Mercado Pago." },
        { status: 400 },
      );
    }

    const customerName = String(
      metadata.customerName ||
        [paymentDetails.payer?.first_name, paymentDetails.payer?.last_name].filter(Boolean).join(" "),
    );

    const payment = await registerPayment({
      email,
      name: customerName || undefined,
      plan,
      stripeSessionId: `mp_pref_${paymentDetails.external_reference || "no_reference"}`,
      stripePriceId: itemId,
      stripePaymentIntentId: `mp_pay_${paymentDetails.id}`,
      stripeEventId: `mp_payment_${paymentDetails.id}`,
      paid: true,
      couponCode: String(metadata.couponCode || "") || undefined,
    });

    console.log("[MP WEBHOOK] pagamento registrado:", payment.id);

    let license;
    try {
      license = await createLicenseFromPayment({
        paymentId: payment.id,
        email,
        name: customerName || undefined,
        plan,
      });
      console.log("[MP WEBHOOK] licença criada:", license.key);
    } catch (error) {
      console.error("[MP WEBHOOK] erro ao criar licença, possível duplicidade:", error);
      return NextResponse.json({
        received: true,
        paymentId: paymentDetails.id,
        paymentRecordId: payment.id,
        warning: "payment_registered_but_license_failed",
      });
    }

    await finalizeAffiliateCredit(payment.id);

    await sendPurchaseEmail({
      to: email,
      customerName: customerName || undefined,
      keyValue: license.key,
      plan: license.plan,
      expiresAt: license.expiresAt,
    });

    await notifyApprovedSale({
      email,
      plan: license.plan,
      amountCents: payment.amount,
      couponCode: payment.couponCode,
    });

    return NextResponse.json({
      received: true,
      paymentId: paymentDetails.id,
      paymentRecordId: payment.id,
      key: license.key,
    });
  } catch (error) {
    console.error("[MP WEBHOOK] erro fatal:", error);
    return NextResponse.json(
      { error: "Falha ao processar webhook do Mercado Pago." },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  return NextResponse.json({
    ok: true,
    route: "mercadopago/webhook",
    topic: url.searchParams.get("topic") || url.searchParams.get("type") || "",
    id: url.searchParams.get("data.id") || url.searchParams.get("id") || "",
  });
}
