// app/marketplace/cta.tsx
"use client"

import { useState } from "react"
import Link from "next/link"

const BORDER = "rgba(255,255,255,0.07)"
const TEXT2  = "#94A3B8"
const BLUE   = "#3B82F6"
const RED    = "#EF4444"
const MUTED  = "#475569"
const TEXT   = "#F1F5F9"

export default function MarketplaceCTA({ total, cities }: { total: number; cities: number }) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]     = useState({ name: "", company: "", phone: "" })
  const [loading, setLoading] = useState(false)
  const [done, setDone]     = useState(false)
  const [error, setError]   = useState("")

  const submit = async () => {
    if (!form.name.trim()) { setError("Informe seu nome."); return }
    if (form.phone.replace(/\D/g, "").length < 10) { setError("WhatsApp inválido."); return }
    setLoading(true); setError("")
    try {
      await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, segment: "Anunciante — Rede completa" }),
      })
      setDone(true)
    } catch { setError("Erro ao enviar.") }
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
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, width: "100%", maxWidth: 480, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: TEXT, marginBottom: 4 }}>Solicitar proposta</div>
                <div style={{ fontSize: 12, color: TEXT2 }}>Anuncie em toda a rede · Resposta em até 2h</div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: TEXT2, fontSize: 22, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              {done ? (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 8 }}>Solicitação enviada!</div>
                  <div style={{ fontSize: 14, color: TEXT2, marginBottom: 20 }}>Nossa equipe entra em contato pelo WhatsApp em até 2 horas.</div>
                  <button onClick={() => setShowModal(false)} style={{ background: BLUE, color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Fechar</button>
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
                    {loading ? "Enviando…" : "Solicitar proposta →"}
                  </button>
                  <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: MUTED }}>📱 Resposta em até 2h · Sem compromisso</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(99,102,241,0.1))", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 16, padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, marginBottom: 8 }}>Quer anunciar em toda a rede?</div>
        <div style={{ fontSize: 14, color: TEXT2, marginBottom: 20 }}>Acesso a {total}+ telas verificadas em {cities}+ cidades com Proof-of-Play auditável.</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => setShowModal(true)} style={{ background: BLUE, color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Solicitar proposta →
          </button>
          <Link href="/trust-center" style={{ background: "transparent", color: TEXT2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 24px", fontSize: 14, textDecoration: "none" }}>
            Ver Trust Center
          </Link>
        </div>
      </div>
    </>
  )
}
