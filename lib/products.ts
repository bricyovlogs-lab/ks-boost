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
    name: 'VKS Optimizer + Placa de Video',
    shortName: 'Optimizer + GPU',
    oldPrice: 'R$ 159,90',
    price: 'R$ 119,90',
    priceCents: 11990,
    icon: '🎯',
    description: 'Otimização completa do Windows com ajustes da placa de vídeo para mais desempenho, estabilidade e fluidez nos jogos.'
    features: ['VKS Optimizer completo', 'Otimização da placa de vídeo', 'Mais FPS e estabilidade', 'Licença vitalícia', 'Suporte para configuração'],
  },
  CROSSHAIR: {
    type: 'CROSSHAIR',
    name: 'VKS Windows Lite',
    shortName: 'Windows Lite',
    oldPrice: 'R$ 59,90',
    price: 'R$ 29,90',
    priceCents: 2990,
    icon: '✚',
    description: 'Windows Lite preparado para quem busca um sistema mais leve, limpo e focado em desempenho.'
    features: ['Windows mais leve', 'Menos processos em segundo plano', 'Melhor desempenho', 'Instalação simplificada', 'Licença vitalícia'],
  },
}

export function normalizeProductType(value?: string | null): ProductTypeName {
  const raw = String(value || '').toUpperCase().trim()
  if (raw === 'PRECISION_FIX' || raw === 'PRECISSION_FIX' || raw === 'VKS_PRECISION_FIX' || raw === 'VKS_PRECISSION_FIX') return 'PRECISSION_FIX'
  if (raw === 'CROSSHAIR' || raw === 'VKS_CROSSHAIR') return 'CROSSHAIR'
  return 'OPTIMIZER'
}
