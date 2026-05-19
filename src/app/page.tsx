import type { Metadata } from "next"
import "./globals.css"

/* =========================
   EXTERNAL STYLES
========================= */

import "leaflet/dist/leaflet.css"

/* =========================
   TOASTER (SONNER)
========================= */

import { Toaster } from "sonner"

/* =========================
   METADATA
========================= */

export const metadata: Metadata = {
  title: "DOOHPLAY Dashboard",
  description:
    "Plataforma de Digital Signage com verificação criptográfica e Trust Graph",
  applicationName: "DOOHPLAY",
  keywords: [
    "DOOH",
    "Digital Signage",
    "Blockchain",
    "Trust Graph",
    "AdTech",
    "ProofChain"
  ]
}

/* =========================
   ROOT LAYOUT
========================= */

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {/* =========================
            APP CONTENT
        ========================== */}

        <div className="min-h-screen flex flex-col">
          {/* HEADER */}
          <header className="border-b bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold tracking-tight">
                DOOHPLAY
              </h1>

              <span className="text-xs text-slate-500">
                Trust Network • Enterprise
              </span>
            </div>
          </header>

          {/* MAIN */}
          <main className="flex-1">
            {children}
          </main>

          {/* FOOTER */}
          <footer className="border-t bg-white px-6 py-3 text-xs text-slate-500">
            © {new Date().getFullYear()} DOOHPLAY — All rights reserved
          </footer>
        </div>

        {/* =========================
            GLOBAL TOASTER
        ========================== */}

        <Toaster
          position="top-right"
          richColors
          closeButton
          expand={false}
        />
      </body>
    </html>
  )
}