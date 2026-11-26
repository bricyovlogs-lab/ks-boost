import { LicensePlan } from "@prisma/client";

type PlanConfig = {
  label: string;
  /** Nome que aparece no checkout do Mercado Pago */
  title: string;
  /** Preço em centavos */
  amount: number;
  /** Preço "de" riscado (centavos) — só para exibição */
  oldAmount?: number;
  durationDays: number | null;
  isLifetime: boolean;
  mercadoPagoItemId: string;
};

export const LICENSE_PLAN_CONFIG: Record<LicensePlan, PlanConfig> = {
  // Produtos vendidos no site (todos vitalícios)
  BOOST_OPTIMIZER: {
    label: "VKS Boost Optimizer",
    title: "VKS Boost Optimizer (vitalício)",
    amount: 4990,
    oldAmount: 10090,
    durationDays: null,
    isLifetime: true,
    mercadoPagoItemId: "VKS_BOOST_OPTIMIZER",
  },
  BOOST_GPU: {
    label: "VKS Optimizer + Placa de Vídeo",
    title: "VKS Optimizer + Placa de Vídeo (vitalício)",
    amount: 11990,
    oldAmount: 15990,
    durationDays: null,
    isLifetime: true,
    mercadoPagoItemId: "VKS_BOOST_GPU",
  },
  WINDOWS_LITE: {
    label: "VKS Windows Lite",
    title: "VKS Windows Lite (vitalício)",
    amount: 2990,
    oldAmount: 5990,
    durationDays: null,
    isLifetime: true,
    mercadoPagoItemId: "VKS_WINDOWS_LITE",
  },
  // Planos antigos: continuam valendo para licenças já vendidas e para o painel admin
  DAYS_30: {
    label: "30 dias",
    title: "VKS BOOST 30 dias",
    amount: 3500,
    durationDays: 30,
    isLifetime: false,
    mercadoPagoItemId: "VKS_BOOST_30_DAYS",
  },
  DAYS_90: {
    label: "90 dias",
    title: "VKS BOOST 90 dias",
    amount: 6500,
    durationDays: 90,
    isLifetime: false,
    mercadoPagoItemId: "VKS_BOOST_90_DAYS",
  },
  LIFETIME: {
    label: "Vitalícia",
    title: "VKS BOOST Vitalícia",
    amount: 9990,
    durationDays: null,
    isLifetime: true,
    mercadoPagoItemId: "VKS_BOOST_LIFETIME",
  },
};

/** Produtos mostrados no site, na ordem dos cards */
export const STORE_PLANS = ["BOOST_OPTIMIZER", "BOOST_GPU", "WINDOWS_LITE"] as const;
export type StorePlan = (typeof STORE_PLANS)[number];

export const STORE_PLAN_FEATURES: Record<StorePlan, string[]> = {
  BOOST_OPTIMIZER: [
    "Windows 10/11 otimizado",
    "Melhor desempenho em jogos",
    "Otimizador completo",
    "Licença vitalícia",
    "Liberação automática da key",
  ],
  BOOST_GPU: [
    "VKS Optimizer completo",
    "Otimização da placa de vídeo",
    "Mais FPS e estabilidade",
    "Licença vitalícia",
    "Suporte para configuração",
  ],
  WINDOWS_LITE: [
    "Windows mais leve",
    "Menos processos em segundo plano",
    "Melhor desempenho",
    "Licença vitalícia",
    "Instalação simplificada",
  ],
};

export const MERCADOPAGO_ITEM_ID_TO_PLAN = Object.entries(LICENSE_PLAN_CONFIG).reduce(
  (acc, [plan, config]) => {
    acc[config.mercadoPagoItemId] = plan as LicensePlan;
    return acc;
  },
  {} as Record<string, LicensePlan>,
);

export const DOWNLOAD_URL =
  process.env.DOWNLOAD_URL || "/downloads/VKSBOOST_Setup.exe";

export const DEFAULT_COMMISSION_PERCENT = 10;
