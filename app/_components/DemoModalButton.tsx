// app/_components/DemoModalButton.tsx
"use client"

import { useState } from "react"

const BLUE  = "#3B82F6"
const TEXT  = "#F1F5F9"
const TEXT2 = "#94A3B8"
const MUTED = "#475569"
const RED   = "#EF4444"

export default function DemoModalButton({
  label = "Falar com especialista →",
  segment = "Enterprise",
  style: customStyle,
}: {
  label?: string
  segment?: string
  style?: React.CSSProperties
}) {
  const [show,    setShow]    = useState(false)
  const [form,    setForm]    = useState({ name: "", company: "", phone: "" })
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState("")

  const submit = async () => {
    if (!form.name.trim()) { setError("Informe seu nome."); return }
    if (form.phone.replace(/\D/g, "").length < 10) { setError("WhatsApp inválido."); return }
    setLoading(true); setError("")
    try {
      await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, segment }),
      })
      setDone(true)
    } catch { setError("Erro ao enviar. Tente novamente.") }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: "#0B1020", border: "1px solid #1F2937",
    borderRadius: 8, padding: "11px 14px",
    color: TEXT, fontSize: 14, outline: "none",
  }

  return (
    <>
      <button onClick={() => setShow(true)} style={customStyle}>
        {label}
      </button>

      {show && (
        <div onClick={() => setShow(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, width: "100%", maxWidth: 480, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: TEXT, marginBottom: 4 }}>Solicitar Demonstração</div>
                <div style={{ fontSize: 12, color: TEXT2 }}>Nossa equipe entra em contato em até 2h pelo WhatsApp</div>
              </div>
              <button onClick={() => setShow(false)} style={{ background: "none", border: "none", color: TEXT2, fontSize: 22, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              {done ? (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 8 }}>Solicitação enviada!</div>
                  <div style={{ fontSize: 14, color: TEXT2, marginBottom: 20 }}>Nossa equipe entra em contato em até 2 horas.</div>
                  <button onClick={() => setShow(false)} style={{ background: BLUE, color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Fechar</button>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: TEXT2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Seu nome *</label>
                    <input style={inputStyle} placeholder="João Silva" value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError("") }} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: TEXT2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Empresa</label>
                    <input style={inputStyle} placeholder="Nome da empresa" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: TEXT2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>WhatsApp (com DDD) *</label>
                    <input style={inputStyle} placeholder="11 99999-9999" type="tel" value={form.phone} onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setError("") }} />
                  </div>
                  {error && <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: RED }}>⚠️ {error}</div>}
                  <button onClick={submit} disabled={loading} style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: loading ? MUTED : BLUE, color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
                    {loading ? "Enviando…" : "Solicitar Demo →"}
                  </button>
                  <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: MUTED }}>📱 Resposta em até 2h · Sem compromisso</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
