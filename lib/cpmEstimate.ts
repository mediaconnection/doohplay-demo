// lib/cpmEstimate.ts
// CPM ilustrativo por faixa de volume de exibições reais (plays_30d) —
// referência pra conversa comercial, não é preço fechado. Extraído em
// 30/08/2026 de app/marketplace/filters.tsx (onde já existia e era usado
// de verdade) pra ser compartilhado também com o AI Revenue Center
// (app/dashboard/local/[code]/ai-revenue), que precisa do mesmo cálculo
// pra estimar receita de um anunciante adicional a partir do volume real
// de exibições da tela.
const CPM_TIERS: { minPlays: number; cpm: number }[] = [
  { minPlays: 500, cpm: 8 },
  { minPlays: 200, cpm: 12 },
  { minPlays: 50, cpm: 15 },
  { minPlays: 0, cpm: 18 },
]

export function cpmEstimateValue(plays30d: number): number {
  const tier = CPM_TIERS.find(t => plays30d > t.minPlays)
  return tier ? tier.cpm : CPM_TIERS[CPM_TIERS.length - 1].cpm
}

export function cpmEstimateLabel(plays30d: number): string {
  return `R$ ${cpmEstimateValue(plays30d).toFixed(2).replace(".", ",")}`
}

// Estimativa de receita mensal de UM anunciante adicional, a partir do
// volume real de exibições da tela (CPM x milheiro de exibições reais).
// Usada pelo AI Revenue Center pra dar um número de referência real (não
// inventado) dentro dos cards de categoria de anunciante — o nome da
// categoria, a descrição e o "match%" continuam ilustrativos, porque não
// existe hoje nenhum algoritmo real de match entre anunciante e tela.
export function estimatedAdvertiserRevenue(plays30d: number): number {
  if (plays30d <= 0) return 0
  return Math.round((plays30d / 1000) * cpmEstimateValue(plays30d))
}
