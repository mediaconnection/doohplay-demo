// lib/theme.ts
//
// Paleta real do produto, centralizada (2026-09-09). Duas variantes
// convivem hoje, cada uma já usada de forma idêntica em pelo menos 2
// lugares antes desta migração — não inventadas aqui, só formalizadas:
//
// - slateDark: app/admin/page.tsx + app/onboarding/page.tsx (valores
//   idênticos nos dois) + app/admin/risk/page.tsx (migrado 2026-09-09).
//   Decidida como a paleta oficial do produto (2026-09-09).
// - lightDefault: app/dashboard/local/[code]/dashboard-client.tsx
//   (tema claro do dashboard do cliente).
// - marketingDark: app/cadastro/route.ts e as ~20 páginas de marketing
//   por vertical (automotivo, barbearias, etc.) — segunda variante
//   escura, deliberadamente separada da oficial (slateDark). Tinha uma
//   inconsistência real de bg entre dois subgrupos (`#0F172A` vs
//   `#0B1120`, quase idênticos) — unificada em `#0F172A` (2026-09-09)
//   antes de formalizar. NÃO foi unificada com slateDark — mudar a
//   paleta de páginas públicas de marketing é decisão de marca
//   separada, não decidida ainda.
//
// app/studio/[code]/page.tsx (Studio guiado): o chrome do editor (fundo
// #f3f4f6, fonte system-ui) continua fora desta formalização — migrar
// seria redesign, não refatoração. Mas a simulação de preview em tela
// cheia (array BACKDROPS + overlay) é deliberadamente escura (imita o
// ambiente real de uma TV) e usa cores literais copiadas do protótipo
// Figma (TVScreenDesigner.tsx) numa sessão anterior — formalizada abaixo
// como previewDark (2026-09-09), sem unificar com slateDark/marketingDark
// (contexto visual diferente: simulação de tela, não chrome de produto).

export const slateDark = {
  bg: "#0B1020",
  surface: "#111827",
  border: "#1F2937",
  text: "#F9FAFB",
  text2: "#9CA3AF",
  muted: "#4B5563",
  blue: "#3B82F6",
  blue2: "#1D4ED8",
  green: "#10B981",
  amber: "#F59E0B",
  purple: "#8B5CF6",
  red: "#EF4444",
}

export const lightDefault = {
  bg: "#F8FAFC",
  white: "#FFFFFF",
  sidebar: "#FFFFFF",
  border: "#E5E7EB",
  border2: "#F3F4F6",
  blue: "#3B82F6",
  blueLt: "#EFF6FF",
  blueBd: "#BFDBFE",
  green: "#10B981",
  greenLt: "#DCFCE7",
  greenBd: "#86EFAC",
  amber: "#D97706",
  amberLt: "#FFFBEB",
  red: "#DC2626",
  redLt: "#FEF2F2",
  redBd: "#FECACA",
  // purple* (2026-09-10): selo "⭐ Simulação" — convenção aprovada em
  // 30/08/2026 pra todo bloco ilustrativo/misto no dashboard do cliente
  // (ver app/dashboard/local/[code]/ai-revenue/ai-revenue-client.tsx),
  // não é decoração de uma tela só. Formalizado aqui pra reuso real.
  purple: "#7C3AED",
  purpleLt: "#F5F3FF",
  purpleBd: "#DDD6FE",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray700: "#374151",
  gray900: "#111827",
  text: "#111827",
  text2: "#6B7280",
  text3: "#9CA3AF",
}

export const marketingDark = {
  bg: "#0F172A",
  surface: "#1E293B",
  border: "#334155",
  text: "#F1F5F9",
  blue: "#3B82F6",
  green: "#10B981",
}

export const previewDark = {
  bg: "#05060E",
  panel: "#0A0C18",
  border: "#232844",
  text: "#ECF0FF",
  muted: "#4A5280",
}

// deviceDark (2026-09-10): a caixa de simulação "Minha TV Agora" em
// app/dashboard/local/[code]/dashboard-client.tsx (TabDashboard) — cores
// já em uso ali antes desta formalização. Deliberadamente separada de
// previewDark: são dois contextos diferentes (edição/preview de conteúdo
// no Studio vs. card de status do dispositivo no dashboard do cliente),
// mesmo que pareçam conceitualmente parecidos — decisão do fundador.
export const deviceDark = {
  bg: "#0F172A",
  text: "#94A3B8",
  muted: "#64748B",
}

// Referência à custom property setada por next/font/google em
// app/layout.tsx (const inter = Inter({ variable: "--font-inter" })).
// Antes de 2026-09-09 o código só escrevia o literal "'Inter', ..." sem a
// fonte nunca estar carregada de verdade (sem next/font, sem link do
// Google Fonts) — renderizava sempre no fallback do sistema. Isso muda a
// aparência real nos arquivos que passarem a usar este export (decisão
// consciente do fundador, não é mais "refatoração pura sem mudança
// visual" nesse ponto específico).
export const FONT_FAMILY = "var(--font-inter), system-ui, sans-serif"
