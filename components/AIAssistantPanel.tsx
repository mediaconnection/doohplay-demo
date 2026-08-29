"use client"

// components/AIAssistantPanel.tsx
// Aba "Assistente IA" do dashboard do dono de tela (app/dashboard/local/[code]).
// Fase 18 (29/08/2026) — porta real do protótipo Figma Make AIAssistant.tsx:
// - Aba Insights: cards vêm de GET /api/client/assistant/insights (SQL
//   determinístico, sem IA, sem custo) — nunca mostra número inventado.
// - Aba Chat: POST /api/client/assistant/message (IA de verdade via
//   Anthropic, server-side) — histórico mantido só em memória do navegador.
import { useState, useEffect, useRef } from "react"

const C = {
  white: "#FFFFFF", border: "#E5E7EB", border2: "#F3F4F6",
  blue: "#3B82F6", blueLt: "#EFF6FF",
  green: "#10B981", greenLt: "#DCFCE7",
  amber: "#D97706", amberLt: "#FFFBEB",
  red: "#DC2626", redLt: "#FEF2F2",
  text: "#111827", text2: "#6B7280", text3: "#9CA3AF",
}

type Insight = {
  id: string; title: string; body: string; impact: string
  color: "success" | "warning" | "danger" | "info"
  view?: string
}

type ChatMessage = { role: "user" | "assistant"; content: string; time: string }

const COLOR_MAP: Record<Insight["color"], { bg: string; fg: string }> = {
  success: { bg: C.greenLt, fg: C.green },
  warning: { bg: C.amberLt, fg: C.amber },
  danger:  { bg: C.redLt,   fg: C.red },
  info:    { bg: C.blueLt,  fg: C.blue },
}

function nowLabel() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function formatMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return <div key={i} style={{ fontWeight: 700, marginTop: 6 }}>{line.slice(2, -2)}</div>
    }
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    return (
      <div key={i} style={{ marginLeft: line.startsWith("-") || /^\d+\./.test(line) ? 8 : 0 }}>
        {parts.map((p, j) => (p.startsWith("**") ? <strong key={j}>{p.slice(2, -2)}</strong> : p))}
      </div>
    )
  })
}

export default function AIAssistantPanel({ code, onNavigate }: { code: string; onNavigate: (tab: string) => void }) {
  const [tab, setTab] = useState<"insights" | "chat">("insights")
  const [insights, setInsights] = useState<Insight[] | null>(null)
  const [insightsError, setInsightsError] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Olá! Sou o assistente da DOOHPLAY. Posso ajudar com dúvidas sobre sua receita, playlist, exibições ou dispositivo. O que você quer saber?", time: nowLabel() },
  ])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [chatError, setChatError] = useState("")
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/client/assistant/insights?code=${code}`)
      .then(r => r.json())
      .then(d => { if (d.insights) setInsights(d.insights); else setInsightsError(d.error ?? "Erro ao carregar insights") })
      .catch(() => setInsightsError("Erro de conexão"))
  }, [code])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, sending])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setChatError("")
    const userMsg: ChatMessage = { role: "user", content: text, time: nowLabel() }
    const history = messages.map(m => ({ role: m.role, content: m.content }))
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setSending(true)
    try {
      const res = await fetch("/api/client/assistant/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, message: text, history }),
      })
      const data = await res.json()
      if (!res.ok) {
        setChatError(data.error ?? "Erro ao consultar o assistente")
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply, time: nowLabel() }])
      }
    } catch {
      setChatError("Erro de conexão")
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "1.5rem" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: "1.25rem", borderBottom: `1px solid ${C.border}` }}>
        {([{ id: "insights", label: `Insights${insights ? ` (${insights.length})` : ""}` }, { id: "chat", label: "Chat" }] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "10px 16px", background: "none", border: "none", borderBottom: tab === t.id ? `2px solid ${C.blue}` : "2px solid transparent", color: tab === t.id ? C.blue : C.text2, fontWeight: tab === t.id ? 600 : 400, fontSize: 13, cursor: "pointer" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "insights" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {insightsError && <div style={{ fontSize: 13, color: C.red }}>{insightsError}</div>}
          {insights === null && !insightsError && <div style={{ fontSize: 13, color: C.text3, textAlign: "center", padding: "2rem 0" }}>Carregando...</div>}
          {insights !== null && insights.length === 0 && (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✨</div>
              <div style={{ fontSize: 13, color: C.text2 }}>Tudo em ordem! Sem alertas no momento.</div>
            </div>
          )}
          {insights?.map(ins => {
            const c = COLOR_MAP[ins.color]
            return (
              <div key={ins.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{ins.title}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: c.bg, color: c.fg, flexShrink: 0, marginLeft: 8 }}>{ins.impact}</span>
                </div>
                <div style={{ fontSize: 12, color: C.text2, lineHeight: 1.5, marginBottom: ins.view ? 10 : 0 }}>{ins.body}</div>
                {ins.view && (
                  <button onClick={() => onNavigate(ins.view!)}
                    style={{ fontSize: 12, fontWeight: 600, color: C.blue, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    Resolver →
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {tab === "chat" && (
        <div style={{ display: "flex", flexDirection: "column", height: "60vh" }}>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "80%", padding: "10px 14px", borderRadius: 14, fontSize: 13, lineHeight: 1.5,
                  background: msg.role === "user" ? C.blue : C.border2,
                  color: msg.role === "user" ? "#fff" : C.text,
                }}>
                  <div>{formatMarkdown(msg.content)}</div>
                  <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7 }}>{msg.time}</div>
                </div>
              </div>
            ))}
            {sending && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ padding: "10px 14px", borderRadius: 14, background: C.border2, fontSize: 13, color: C.text3 }}>Digitando...</div>
              </div>
            )}
            {chatError && <div style={{ fontSize: 12, color: C.red }}>{chatError}</div>}
            <div ref={endRef} />
          </div>
          <div style={{ display: "flex", gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Pergunte sobre receita, playlist, exibições..."
              style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, outline: "none" }} />
            <button onClick={send} disabled={!input.trim() || sending}
              style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: input.trim() && !sending ? C.blue : C.border, color: "#fff", fontSize: 13, fontWeight: 600, cursor: input.trim() && !sending ? "pointer" : "not-allowed" }}>
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
