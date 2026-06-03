"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function StudioPage() {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/studio/auth?code=${code.trim().toUpperCase()}`)
      const data = await res.json()
      if (data.ok) {
        router.push(`/studio/${code.trim().toUpperCase()}`)
      } else {
        setError("Código inválido. Verifique e tente novamente.")
      }
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Georgia, serif",
    }}>
      {/* Fundo decorativo */}
      <div style={{
        position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, #C9A84C08 0%, transparent 70%)",
      }} />

      <div style={{ width: "100%", maxWidth: 420, padding: "0 1.5rem", position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 8 }}>
            DOOHPLAY
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}>
            Studio
          </div>
          <div style={{ fontSize: 13, color: "#ffffff40", marginTop: 6 }}>
            Crie e publique seus anúncios
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "#111",
          border: "1px solid #C9A84C20",
          borderRadius: 20,
          padding: "2rem",
        }}>
          <div style={{ fontSize: 13, color: "#ffffff60", marginBottom: 6 }}>
            Código de acesso
          </div>
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="Ex: ZIMERM"
            maxLength={8}
            style={{
              width: "100%",
              background: "#1a1a1a",
              border: `1px solid ${error ? "#ef4444" : "#ffffff15"}`,
              borderRadius: 10,
              padding: "14px 16px",
              fontSize: 20,
              color: "#C9A84C",
              fontFamily: "monospace",
              letterSpacing: "0.2em",
              outline: "none",
              boxSizing: "border-box",
              textTransform: "uppercase",
            }}
            autoFocus
          />
          {error && (
            <div style={{ fontSize: 12, color: "#ef4444", marginTop: 8 }}>{error}</div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !code.trim()}
            style={{
              width: "100%",
              marginTop: "1.25rem",
              background: loading || !code.trim() ? "#C9A84C50" : "#C9A84C",
              color: "#0a0a0a",
              border: "none",
              borderRadius: 10,
              padding: "14px",
              fontSize: 14,
              fontWeight: 700,
              cursor: loading || !code.trim() ? "not-allowed" : "pointer",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              transition: "all 0.15s",
            }}
          >
            {loading ? "Verificando..." : "Entrar no Studio →"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: 11, color: "#ffffff20" }}>
          Código fornecido pelo seu consultor DOOHPLAY
        </div>
      </div>
    </main>
  )
}
