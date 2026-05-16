export const dynamic = "force-dynamic"

import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"

import { Toaster } from "sonner"

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
        <Toaster position="top-right" richColors />

        <header className="w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-3 md:flex-row md:items-center md:justify-between">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight transition-colors hover:text-black"
            >
              DOOHPLAY
            </Link>

            <nav className="flex flex-wrap items-center gap-4 text-sm text-gray-600 md:gap-6">
              <Link href="/" className="transition-colors hover:text-black">
                Home
              </Link>

              <Link href="/verify" className="transition-colors hover:text-black">
                Verificar
              </Link>

              <Link href="/proof" className="transition-colors hover:text-black">
                Explorer
              </Link>

              <Link href="/network/map" className="transition-colors hover:text-black">
                Network Map
              </Link>

              <Link href="/players" className="transition-colors hover:text-black">
                Players
              </Link>

              <Link href="/campaigns" className="transition-colors hover:text-black">
                Campanhas
              </Link>
            </nav>
          </div>
        </header>

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