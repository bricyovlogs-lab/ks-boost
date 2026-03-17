import { LicensePlan } from "@prisma/client";

export const LICENSE_PLAN_CONFIG: Record<
  LicensePlan,
  {
    label: string;
    amount: number;
    durationDays: number | null;
    isLifetime: boolean;
    mercadoPagoItemId: string;
  }
> = {
  DAYS_30: {
    label: "30 dias",
    amount: 3500,
    durationDays: 30,
    isLifetime: false,
    mercadoPagoItemId: "VKS_BOOST_30_DAYS",
  },
  DAYS_90: {
    label: "90 dias",
    amount: 6500,
    durationDays: 90,
    isLifetime: false,
    mercadoPagoItemId: "VKS_BOOST_90_DAYS",
  },
  LIFETIME: {
    label: "Vitalícia",
    amount: 9990,
    durationDays: null,
    isLifetime: true,
    mercadoPagoItemId: "VKS_BOOST_LIFETIME",
  },
};

export const MERCADOPAGO_ITEM_ID_TO_PLAN = Object.entries(LICENSE_PLAN_CONFIG).reduce(
  (acc, [plan, config]) => {
    acc[config.mercadoPagoItemId] = plan as LicensePlan;
    return acc;
  },
  {} as Record<string, LicensePlan>,
);

export const DOWNLOAD_URL =
  process.env.DOWNLOAD_URL || "https://example.com/VKS-BOOST-Setup.exe";

export const DEFAULT_COMMISSION_PERCENT = 10;
