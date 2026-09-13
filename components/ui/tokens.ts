// components/ui/tokens.ts
// Sistema de design formalizado (Fases 0-2, aprovado pelo fundador em
// 2026-09-13 — ver STATUS_PROJETO.md, "Sistema de design — Fases 0 a 3").
// Espaçamento/raio/tipografia/elevação são independentes de tema — cor
// continua vindo de lib/theme.ts, passada como prop `theme` por cada
// componente (ver theme-shape.ts).

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 48,
} as const

export const radius = {
  card: 12,
  chip: 8,
  pill: 20,
} as const

export const typography = {
  caption: { fontSize: 12, fontWeight: 500 },
  body: { fontSize: 14, fontWeight: 400 },
  label: { fontSize: 14, fontWeight: 600 },
  subtitle: { fontSize: 18, fontWeight: 700 },
  title: { fontSize: 24, fontWeight: 800 },
} as const

export const elevation = {
  sm: "0 1px 3px rgba(0,0,0,.12)",
  md: "0 8px 24px rgba(0,0,0,.16)",
  lg: "0 20px 60px rgba(0,0,0,.24)",
} as const

export type TypoLevel = keyof typeof typography
export type ElevationLevel = keyof typeof elevation
