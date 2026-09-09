"use client"

import { useEffect, useState } from "react"
import { slateDark as C, FONT_FAMILY } from "@/lib/theme"

type Client = {
  id: number
  name: string
  blocked_reason: string
  blocked_at: string
  risk_snapshot: any
}

function formatDate(d: string) {
  if (!d) return "—"
  return new Date(d).toLocaleString("pt-BR")
}

export default function RiskDashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/risk/blocked")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erro ao carregar clientes bloqueados")
      setClients(data.data || [])
    } catch (err: any) {
      setError(err.message ?? "Erro ao carregar clientes bloqueados")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function review(clientId: number, decision: "approved" | "rejected") {
    setReviewing(clientId)
    setError(null)
    try {
      const res = await fetch("/api/risk/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          decision,
          reviewedBy: "admin@doohplay.com",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.formErrors?.join(", ") ?? data.error ?? "Erro ao revisar cliente")
      await fetchData()
    } catch (err: any) {
      setError(err.message ?? "Erro ao revisar cliente")
    }
    setReviewing(null)
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT_FAMILY, padding: "32px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <span style={{ fontSize: 24 }}>🚨</span>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Revisão de risco</div>
          <div style={{ fontSize: 13, color: C.text2 }}>Clientes bloqueados automaticamente, aguardando decisão manual</div>
        </div>
      </div>

      {error && (
        <div style={{ background: C.red + "18", border: `1px solid ${C.red}44`, color: C.red, borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: C.text2, fontSize: 14 }}>Carregando…</div>
      ) : clients.length === 0 ? (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, textAlign: "center", color: C.text2, fontSize: 14 }}>
          Nenhum cliente bloqueado aguardando revisão.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {clients.map((c) => (
            <div key={c.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: C.text2 }}>ID {c.id} · bloqueado em {formatDate(c.blocked_at)}</div>
                </div>
                <span style={{ background: C.amber + "20", color: C.amber, border: `1px solid ${C.amber}44`, borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {c.blocked_reason || "Sem motivo informado"}
                </span>
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, color: C.text2, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Snapshot de risco
              </div>
              <pre style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, fontSize: 12, color: C.text2, overflow: "auto", margin: 0, marginBottom: 14, fontFamily: "monospace" }}>
                {JSON.stringify(c.risk_snapshot, null, 2)}
              </pre>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => review(c.id, "rejected")}
                  disabled={reviewing === c.id}
                  style={{ background: "transparent", color: C.red, border: `1px solid ${C.red}44`, borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: reviewing === c.id ? "not-allowed" : "pointer" }}
                >
                  Manter bloqueado
                </button>
                <button
                  onClick={() => review(c.id, "approved")}
                  disabled={reviewing === c.id}
                  style={{ background: reviewing === c.id ? C.muted : C.green, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: reviewing === c.id ? "not-allowed" : "pointer" }}
                >
                  {reviewing === c.id ? "Aguarde…" : "Aprovar (desbloquear)"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
