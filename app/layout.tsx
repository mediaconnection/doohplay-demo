import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"

import AppHeader from "./_components/AppHeader"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "DOOHPLAY Audit Portal",
    template: "%s | DOOHPLAY",
  },
  description:
    "Public verification portal for DOOHPLAY cryptographic advertising ledger",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={[
          geistSans.variable,
          geistMono.variable,
          "min-h-screen bg-gray-50 text-gray-900 antialiased flex flex-col",
        ].join(" ")}
      >
        <AppHeader />

        {/* div, not main — page components use <main> as their root landmark */}
        <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
          {children}
        </div>

        <footer className="border-t bg-white py-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} DOOHPLAY — Trust Infrastructure
        </footer>
      </body>
    </html>
  )
}
