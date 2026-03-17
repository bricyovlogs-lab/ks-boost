import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    received: false,
    message: "Integração principal migrada para Mercado Pago. Use /api/mercadopago/webhook.",
  });
}
