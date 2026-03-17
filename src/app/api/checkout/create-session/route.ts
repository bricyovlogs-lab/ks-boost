import { NextResponse } from "next/server";
import { LicensePlan } from "@prisma/client";
import { LICENSE_PLAN_CONFIG } from "@/lib/constants";
import { createMercadoPagoPreference } from "@/lib/mercadopago";
import { createCheckoutSessionSchema } from "@/validators/checkout";
import {
  calculateDiscountedAmount,
  findValidCoupon,
  registerPayment,
} from "@/modules/licenses/license.service";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const input =
    contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());

  const payload = createCheckoutSessionSchema.parse({
    plan: input.plan,
    email: input.email,
    name: input.name || undefined,
    couponCode: input.couponCode || "",
  });

  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "Mercado Pago não configurado. Defina MERCADOPAGO_ACCESS_TOKEN no .env." },
      { status: 500 }
    );
  }

  const plan = payload.plan as LicensePlan;
  const config = LICENSE_PLAN_CONFIG[plan];
  const coupon = await findValidCoupon(payload.couponCode);
  const { finalAmount } = calculateDiscountedAmount(config.amount, coupon);

  const externalReference = `VKS-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const preference = await createMercadoPagoPreference({
    title: `VKS BOOST ${config.label}`,
    unitPrice: Number((finalAmount / 100).toFixed(2)),
    quantity: 1,
    payerEmail: payload.email,
    payerName: payload.name || undefined,
    itemId: config.mercadoPagoItemId,
    externalReference,
    notificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/mercadopago/webhook`,
    metadata: {
      plan,
      customerName: payload.name || "",
      customerEmail: payload.email,
      couponCode: coupon?.code || "",
      itemId: config.mercadoPagoItemId,
      externalReference,
    },
  });

  await registerPayment({
    email: payload.email,
    name: payload.name,
    plan,
    stripeSessionId: `mp_pref_${preference.id}`,
    stripePriceId: config.mercadoPagoItemId,
    stripePaymentIntentId: externalReference,
    paid: false,
    couponCode: payload.couponCode || undefined,
  });

  const checkoutUrl = preference.sandbox_init_point || preference.init_point;
  if (!checkoutUrl) {
    return NextResponse.json({ error: "Mercado Pago não retornou URL de checkout." }, { status: 500 });
  }

  if (contentType.includes("application/json")) {
    return NextResponse.json({ url: checkoutUrl });
  }

  return NextResponse.redirect(checkoutUrl);
}
