// components/ui/theme-shape.ts
// Shape mínimo que os componentes de components/ui/ precisam de um tema de
// lib/theme.ts. Não é uma normalização entre temas (slateDark/marketingDark
// têm chaves diferentes) — decisão consciente de deixar isso pra quando/se
// o sistema for generalizado (ver STATUS_PROJETO.md, Fase 3, "sub-decisão
// de normalização de tema"). Por enquanto, `lightDefault` satisfaz este
// shape estruturalmente, sem precisar de nenhum mapa.
export interface UiTheme {
  white: string
  border: string
  border2?: string
  text: string
  text2: string
  text3?: string
  blue: string
  blueLt?: string
  blueBd?: string
  green: string
  greenLt?: string
  greenBd?: string
  red: string
  redLt?: string
  redBd?: string
  amber?: string
  amberLt?: string
  purple?: string
  purpleLt?: string
  purpleBd?: string
  gray100?: string
}
