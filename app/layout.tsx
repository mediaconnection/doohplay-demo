import type { ReactNode } from "react"
import { Inter } from "next/font/google"

import "./globals.css"

// Achado 2026-09-09 (formalização de design tokens, ver lib/theme.ts):
// várias telas já escreviam fontFamily: "'Inter', ..." sem a fonte nunca
// ter sido carregada de verdade — caíam sempre no fallback do sistema.
// Carrega Inter de verdade aqui; disponível via var(--font-inter) pra
// quem usar lib/theme.ts's FONT_FAMILY (só onboarding e dashboard/local
// migrados por ora, o resto do código continua com o literal antigo,
// sem mudança de comportamento pra eles).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })

export const metadata = {
  title: "Admin | DOOHPLAY",
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body style={{ margin: 0, padding: 0, background: "#0B1020" }}>
        {children}
      </body>
    </html>
  )
}
