// app/login/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const BG      = "#0B1020"
const SURFACE = "#111827"
const BORDER  = "#1F2937"
const TEXT    = "#F9FAFB"
const TEXT2   = "#9CA3AF"
const MUTED   = "#4B5563"
const BLUE    = "#3B82F6"
const GREEN   = "#10B981"
const RED     = "#EF4444"

type Role = "client" | "advertiser" | "admin"
type Step = "role" | "contact" | "otp"
type Method = "whatsapp" | "email"

const ROLES = [
  { id: "client",     label: "Sou dono de tela",  icon: "📺", desc: "Acesse seu dashboard e relatórios"     },
  { id: "advertiser", label: "Sou anunciante",     icon: "📢", desc: "Gerencie campanhas e mídias"           },
  { id: "admin",      label: "Administrador",      icon: "⚙️", desc: "Acesso ao painel administrativo"       },
]

export default function LoginPage() {
  const router = useRouter()
  const [step,    setStep]    = useState<Step>("role")
  const [role,    setRole]    = useState<Role | null>(null)
  const [method,  setMethod]  = useState<Method>("whatsapp")
  const [contact, setContact] = useState("")
  const [otp,     setOtp]     = useState("")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const [info,    setInfo]    = useState("")

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: BG, border: `1px solid ${BORDER}`,
    borderRadius: 8, padding: "11px 14px",
    color: TEXT, fontSize: 14, outline: "none",
  }

  const handleSelectRole = (r: Role) => {
    setRole(r)
    setError("")
    if (r === "admin") {
      router.push("/admin/login")
      return
    }
    setStep("contact")
  }

  const handleSendOtp = async () => {
    if (!contact.trim()) { setError("Preencha o campo acima."); return }
    setLoading(true); setError(""); setInfo("")
    try {
      const res  = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: contact.trim(), method, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao enviar código")
      setInfo(method === "whatsapp"
        ? `Código enviado para WhatsApp ${contact}`
        : `Código enviado para ${contact}`)
      setStep("otp")
    } catch (err: any) {
      setError(err.message || "Erro ao enviar código")
    }
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
    if (otp.length < 6) { setError("Digite o código de 6 dígitos."); return }
    setLoading(true); setError("")
    try {
      const res  = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: contact.trim(), otp, method, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Código inválido")
      // Redireciona para o dashboard correto
      router.push(data.redirect)
    } catch (err: any) {
      setError(err.message || "Código inválido ou expirado")
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif", padding: 24 }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input::placeholder { color: #4B5563; }`}</style>

      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "2.5rem", width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #3B82F6, #6366F1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>
            <span style={{ color: TEXT }}>DOOH</span><span style={{ color: BLUE }}>PLAY</span>
          </span>
        </div>

        {/* STEP: ROLE */}
        {step === "role" && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 6 }}>Bem-vindo</div>
            <div style={{ fontSize: 13, color: TEXT2, marginBottom: 24 }}>Como deseja acessar?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ROLES.map(r => (
                <button key={r.id} onClick={() => handleSelectRole(r.id as Role)} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  background: BG, border: `1px solid ${BORDER}`,
                  borderRadius: 12, padding: "14px 16px",
                  cursor: "pointer", textAlign: "left", width: "100%",
                  transition: "border-color .15s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = BLUE + "66")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = BORDER)}
                >
                  <span style={{ fontSize: 24 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: TEXT2, marginTop: 2 }}>{r.desc}</div>
                  </div>
                  <svg style={{ marginLeft: "auto", flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP: CONTACT */}
        {step === "contact" && (
          <div>
            <button onClick={() => { setStep("role"); setError("") }} style={{ background: "none", border: "none", color: TEXT2, fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>
              ← Voltar
            </button>
            <div style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 6 }}>
              {role === "client" ? "Acesso — Dono de tela" : "Acesso — Anunciante"}
            </div>
            <div style={{ fontSize: 13, color: TEXT2, marginBottom: 24 }}>
              Enviaremos um código de verificação
            </div>

            {/* Método */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[
                { id: "whatsapp", label: "📱 WhatsApp" },
                { id: "email",   label: "✉️ Email"     },
              ].map(m => (
                <button key={m.id} onClick={() => { setMethod(m.id as Method); setContact(""); setError("") }} style={{
                  flex: 1, padding: "9px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: method === m.id ? BLUE + "18" : "transparent",
                  border: `1px solid ${method === m.id ? BLUE + "66" : BORDER}`,
                  color: method === m.id ? BLUE : TEXT2,
                }}>
                  {m.label}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: TEXT2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {method === "whatsapp" ? "WhatsApp (com DDD)" : "Email"}
              </label>
              <input
                style={inputStyle}
                type={method === "email" ? "email" : "tel"}
                placeholder={method === "whatsapp" ? "11 99999-9999" : "seu@email.com"}
                value={contact}
                onChange={e => { setContact(e.target.value); setError("") }}
                onKeyDown={e => e.key === "Enter" && handleSendOtp()}
              />
            </div>

            {error && (
              <div style={{ background: RED + "18", border: `1px solid ${RED}44`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: RED }}>
                ⚠️ {error}
              </div>
            )}

            <button onClick={handleSendOtp} disabled={loading} style={{ width: "100%", background: loading ? MUTED : BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Enviando…" : "Enviar código →"}
            </button>
          </div>
        )}

        {/* STEP: OTP */}
        {step === "otp" && (
          <div>
            <button onClick={() => { setStep("contact"); setOtp(""); setError("") }} style={{ background: "none", border: "none", color: TEXT2, fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>
              ← Voltar
            </button>
            <div style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 6 }}>Verificar código</div>
            {info && (
              <div style={{ background: GREEN + "12", border: `1px solid ${GREEN}33`, borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: GREEN }}>
                ✓ {info}
              </div>
            )}
            <div style={{ fontSize: 13, color: TEXT2, marginBottom: 24 }}>
              Digite o código de 6 dígitos
            </div>

            <div style={{ marginBottom: 20 }}>
              <input
                style={{ ...inputStyle, fontSize: 24, fontWeight: 700, letterSpacing: "0.3em", textAlign: "center" }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={e => { setOtp(e.target.value.replace(/\D/g, "")); setError("") }}
                onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
              />
            </div>

            {error && (
              <div style={{ background: RED + "18", border: `1px solid ${RED}44`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: RED }}>
                ⚠️ {error}
              </div>
            )}

            <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6} style={{ width: "100%", background: loading || otp.length < 6 ? MUTED : BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 700, cursor: loading || otp.length < 6 ? "not-allowed" : "pointer" }}>
              {loading ? "Verificando…" : "Entrar →"}
            </button>

            <button onClick={handleSendOtp} disabled={loading} style={{ width: "100%", background: "transparent", border: "none", color: TEXT2, fontSize: 13, cursor: "pointer", marginTop: 12, padding: "8px" }}>
              Reenviar código
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
