import { DOWNLOAD_URL, LICENSE_PLAN_CONFIG } from "@/lib/constants";
import { resend } from "@/lib/resend";
import { buildPurchaseEmailHtml } from "@/modules/email/templates/purchase-confirmation";
import { LicensePlan } from "@prisma/client";

export async function sendPurchaseEmail(params: {
  to: string;
  customerName?: string | null;
  keyValue: string;
  plan: LicensePlan;
  expiresAt: Date | null;
}) {
  const html = buildPurchaseEmailHtml({
    customerName: params.customerName,
    keyValue: params.keyValue,
    planLabel: LICENSE_PLAN_CONFIG[params.plan].label,
    expiresAt: params.expiresAt,
    downloadUrl: DOWNLOAD_URL,
  });

  if (!resend || !process.env.MAIL_FROM) {
    console.warn("Resend/MAIL_FROM não configurados. Email não enviado.", params.to);
    return;
  }

  await resend.emails.send({
    from: process.env.MAIL_FROM,
    to: params.to,
    subject: "Sua licença do VKS BOOST foi liberada",
    html,
  });
}
