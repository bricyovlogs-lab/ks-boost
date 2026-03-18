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

function maybeValidateSignature(request: NextRequest, dataId: string) {
  const secret = getMercadoPagoWebhookSecret();
  if (!secret) return true;

  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id") || "";
  const url = new URL(request.url);
  const dataIdUrl = url.searchParams.get("data.id") || url.searchParams.get("id") || dataId || "";

  if (!signature || !requestId || !dataIdUrl) return false;

  const parts = Object.fromEntries(
    signature.split(",").map((part) => {
      const [k, v] = part.split("=");
      return [k?.trim(), v?.trim()];
    }),
  );

  const ts = parts["ts"] || "";
  const v1 = parts["v1"] || "";
  if (!ts || !v1) return false;

  const manifest = `id:${dataIdUrl};request-id:${requestId};ts:${ts};`;
  const digest = createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(v1));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const body = await request.json().catch(() => ({}));

  const topic =
    url.searchParams.get("topic") ||
    url.searchParams.get("type") ||
    body.type ||
    body.topic ||
    "";

  const dataId =
    url.searchParams.get("data.id") ||
    url.searchParams.get("id") ||
    body?.data?.id ||
    body?.id ||
    "";

  if (!dataId) {
    return NextResponse.json({ received: true, ignored: "missing_id" });
  }

  if (!maybeValidateSignature(request, String(dataId))) {
    return NextResponse.json({ error: "Assinatura inválida do Mercado Pago." }, { status: 401 });
  }

  if (topic != "payment") {
    return NextResponse.json({ received: true, ignored: topic || "unknown_topic" });
  }

  const paymentDetails = await getMercadoPagoPayment(String(dataId));

  if (paymentDetails.status !== "approved") {
    return NextResponse.json({ received: true, ignored: paymentDetails.status || "not_approved" });
  }

  const metadata = paymentDetails.metadata || {};
  const itemId = String(metadata.itemId || paymentDetails.additional_info?.items?.[0]?.id || "");
  const plan = MERCADOPAGO_ITEM_ID_TO_PLAN[itemId];

  if (!plan) {
    return NextResponse.json({ error: "Plano não reconhecido no pagamento do Mercado Pago." }, { status: 400 });
  }

  const email = String(metadata.customerEmail || paymentDetails.payer?.email || "");
  if (!email) {
    return NextResponse.json({ error: "Email não encontrado no pagamento do Mercado Pago." }, { status: 400 });
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

  const license = await createLicenseFromPayment({
    paymentId: payment.id,
    email,
    name: customerName || undefined,
    plan,
  });

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

  return NextResponse.json({ received: true, paymentId: paymentDetails.id });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
