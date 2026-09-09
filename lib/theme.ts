// lib/theme.ts
//
// Paleta real do produto, centralizada (2026-09-09). Duas variantes
// convivem hoje, cada uma já usada de forma idêntica em pelo menos 2
// lugares antes desta migração — não inventadas aqui, só formalizadas:
//
// - slateDark: app/admin/page.tsx + app/onboarding/page.tsx (valores
//   idênticos nos dois). Existe uma segunda variante escura próxima,
//   usada em app/cadastro/route.ts e na família de páginas de marketing
//   (#0F172A/#1E293B/#334155, com variações entre si) — decidido
//   (2026-09-09) que slateDark (esta) é a oficial; a outra fica
//   documentada aqui só como referência, não migrada ainda.
// - lightDefault: app/dashboard/local/[code]/dashboard-client.tsx
//   (tema claro do dashboard do cliente).
//
// app/studio/[code]/page.tsx (Studio guiado) NÃO usa nenhuma das duas
// hoje (fundo #f3f4f6, fonte system-ui, tons ad-hoc próprios) — fica de
// fora desta formalização de propósito; migrar seria redesign, não
// refatoração.

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

// Referência à custom property setada por next/font/google em
// app/layout.tsx (const inter = Inter({ variable: "--font-inter" })).
// Antes de 2026-09-09 o código só escrevia o literal "'Inter', ..." sem a
// fonte nunca estar carregada de verdade (sem next/font, sem link do
// Google Fonts) — renderizava sempre no fallback do sistema. Isso muda a
// aparência real nos arquivos que passarem a usar este export (decisão
// consciente do fundador, não é mais "refatoração pura sem mudança
// visual" nesse ponto específico).
export const FONT_FAMILY = "var(--font-inter), system-ui, sans-serif"
