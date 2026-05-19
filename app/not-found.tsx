export const dynamic = "force-dynamic"

import Link from "next/link"

export default function NotFound() {
  return (
    <main style={{ padding: 40, fontFamily: "Arial", textAlign: "center" }}>
      <h1 style={{ fontSize: 48, fontWeight: 700 }}>404</h1>
      <p style={{ color: "#666", marginTop: 8 }}>Página não encontrada</p>
      <Link href="/" style={{ marginTop: 24, display: "inline-block", color: "#111" }}>
        ← Voltar ao início
      </Link>
    </main>
  )
}
