import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"

import AppHeader from "./_components/AppHeader"

/* =========================
   FONTS
========================= */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

/* =========================
   METADATA
========================= */

export const metadata: Metadata = {
  title: {
    default: "DOOHPLAY Audit Portal",
    template: "%s | DOOHPLAY",
  },
  description:
    "Public verification portal for DOOHPLAY cryptographic advertising ledger",
}

/* =========================
   VIEWPORT
========================= */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

/* =========================
   LAYOUT
========================= */

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          min-h-screen
          bg-gray-50
          text-gray-900
          antialiased
          flex
          flex-col
        `}
      >
        <AppHeader />

        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
          {children}
        </main>

        <footer className="border-t bg-white py-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} DOOHPLAY — Trust Infrastructure
        </footer>
      </body>
    </html>
  )
}
