// app/admin/login/page.tsx
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

const BG      = "#0B1020"
const SURFACE = "#111827"
const BORDER  = "#1F2937"
const TEXT    = "#F9FAFB"
const TEXT2   = "#9CA3AF"
const BLUE    = "#3B82F6"
const PURPLE  = "#8B5CF6"
const RED     = "#EF4444"

export default function AdminLoginPage() {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  const handle = async () => {
    if (!email || !password) { setError("Preencha email e senha."); return }
    setLoading(true); setError("")
    const res = await signIn("credentials", {
      email, password, redirect: false,
    })
    if (res?.ok) {
      router.push("/admin")
    } else {
      setError("Email ou senha incorretos.")
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input::placeholder { color: #4B5563; }`}</style>
      <div style={{ background: SURFACE, border: "1px solid " + BORDER, borderRadius: 16, padding: "2.5rem", width: 380 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg," + BLUE + "," + PURPLE + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>D</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>DOOHPLAY</div>
            <div style={{ fontSize: 11, color: TEXT2 }}>Painel Admin</div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, color: TEXT2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handle()}
            placeholder="admin@doohplay.com.br"
            style={{ width: "100%", background: BG, border: "1px solid " + BORDER, borderRadius: 8, padding: "10px 14px", color: TEXT, fontSize: 14, outline: "none" }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, color: TEXT2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Senha</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handle()}
            placeholder="••••••••••••"
            style={{ width: "100%", background: BG, border: "1px solid " + BORDER, borderRadius: 8, padding: "10px 14px", color: TEXT, fontSize: 14, outline: "none" }}
          />
        </div>

        {error && (
          <div style={{ fontSize: 12, color: RED, marginBottom: 16, background: RED + "18", border: "1px solid " + RED + "44", borderRadius: 8, padding: "8px 12px" }}>
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handle}
          disabled={loading || !email || !password}
          style={{ width: "100%", background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "11px", fontSize: 14, fontWeight: 600, cursor: loading || !email || !password ? "not-allowed" : "pointer", opacity: loading || !email || !password ? 0.7 : 1 }}
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </div>
    </div>
  )
}
