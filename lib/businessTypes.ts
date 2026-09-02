// lib/businessTypes.ts
// Lista canônica de tipos de negócio, compartilhada por /cadastro e
// /onboarding (achado 2026-09-02: as duas rotas tinham listas hardcoded
// divergentes — "Cafeteria"/"Pet shop" em /onboarding não correspondiam a
// nenhum canal real em inventory_segments_v2.criteria_json->business_types,
// que usa comparação de string exata). Esta lista bate com os 5 segmentos
// reais hoje: Canal Pet & Animais = ["Petshop"], Canal Varejo & Mercado =
// ["Mercado"], Canal Jornalismo/Turismo/Diversão = todos os itens abaixo
// exceto "Outro". Mudar esta lista sem atualizar inventory_segments_v2 (ou
// vice-versa) quebra a segmentação de canal — os dois precisam ficar em
// sincronia manual.
export const BUSINESS_TYPES = [
  "Academia",
  "Automotivo",
  "Bar",
  "Barbearia",
  "Casa & Serviços",
  "Clínica",
  "Condomínio",
  "Farmácia",
  "Lanchonete",
  "Loja de Roupas",
  "Mercado",
  "Padaria",
  "Petshop",
  "Restaurante",
  "Salão de Beleza",
  "Outro",
] as const
