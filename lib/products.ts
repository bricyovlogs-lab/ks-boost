export type ProductTypeName = 'OPTIMIZER' | 'PRECISSION_FIX' | 'CROSSHAIR'

export const productCatalog: Record<ProductTypeName, {
  type: ProductTypeName
  name: string
  shortName: string
  oldPrice: string
  price: string
  priceCents: number
  icon: string
  description: string
  features: string[]
}> = {
  OPTIMIZER: {
    type: 'OPTIMIZER',
    name: 'VKS Boost Optimizer',
    shortName: 'Optimizer',
    oldPrice: 'R$ 100,90',
    price: 'R$ 49,90',
    priceCents: 4990,
    icon: '⚡',
    description: 'Otimização completa para Windows 10/11, mais FPS, menos travamentos e melhor fluidez nos jogos.',
    features: ['Windows 10/11 otimizado', 'Remoção de gargalos', 'Otimizador completo', 'Licença vitalícia', 'Liberação automática da key'],
  },
  PRECISSION_FIX: {
    type: 'PRECISSION_FIX',
    name: 'VKS Precision FIX',
    shortName: 'Precision FIX',
    oldPrice: 'R$ 159,90',
    price: 'R$ 79,90',
    priceCents: 7990,
    icon: '🎯',
    description: 'Ajustes competitivos para melhorar controle de mira, resposta e precisão no mouse/teclado.',
    features: ['Ajustes para precisão', 'Melhor controle de mira', 'Configurações competitivas', 'Licença vitalícia', 'Perfil para jogadores competitivos'],
  },
  CROSSHAIR: {
    type: 'CROSSHAIR',
    name: 'VKS Crosshair',
    shortName: 'Crosshair',
    oldPrice: 'R$ 15,90',
    price: 'R$ 10,00',
    priceCents: 1000,
    icon: '✚',
    description: 'Mira personalizada na tela para jogos, ideal para quem quer visual mais limpo e competitivo.',
    features: ['Crosshair para jogos', 'Visual limpo', 'Configuração rápida', 'Baixo consumo', 'Licença vitalícia'],
  },
}

export function normalizeProductType(value?: string | null): ProductTypeName {
  const raw = String(value || '').toUpperCase().trim()
  if (raw === 'PRECISION_FIX' || raw === 'PRECISSION_FIX' || raw === 'VKS_PRECISION_FIX' || raw === 'VKS_PRECISSION_FIX') return 'PRECISSION_FIX'
  if (raw === 'CROSSHAIR' || raw === 'VKS_CROSSHAIR') return 'CROSSHAIR'
  return 'OPTIMIZER'
}
