import Link from "next/link"
import { Toaster } from "sonner"

export default function AppHeader() {
  return (
    <>
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
    </>
  )
}
