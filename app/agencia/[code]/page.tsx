// app/agencia/[code]/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const BG      = "#0B1020"
const SURFACE = "#111827"
const BORDER  = "#1F2937"
const TEXT     = "#F9FAFB"
const TEXT2    = "#9CA3AF"
const MUTED    = "#4B5563"
const BLUE     = "#3B82F6"
const GREEN    = "#10B981"
const AMBER    = "#F59E0B"
const RED      = "#EF4444"
const PURPLE   = "#8B5CF6"

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n/1_000).toFixed(1)}K`
  return n.toLocaleString("pt-BR")
}
function brl(n: number) {
  return `R$ ${Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function timeSince(ts: string | null) {
  if (!ts) return "sem dados"
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (diff < 60)    return `${diff}s atrás`
  if (diff < 3600)  return `${Math.floor(diff / 60)}min atrás`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`
  return `${Math.floor(diff / 86400)}d atrás`
}

function KpiCard({ label, value, color, icon }: { label: string; value: string; color?: string; icon: string }) {
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px", flex: 1, minWidth: 150 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color ?? TEXT, letterSpacing: "-0.03em" }}>{value}</div>
    </div>
  )
}

export default function AgencyPage({ params }: { params: { code: string } }) {
  const [data,    setData]    = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")
  const [search,  setSearch]  = useState("")
  const [filter,  setFilter]  = useState("todos")

  const code = params.code?.toUpperCase()

  const load = async () => {
    try {
      const res = await fetch(`/api/agency/${code}`, { cache: "no-store" })
      if (!res.ok) throw new Error("Agência não encontrada")
      setData(await res.json())
    } catch (err: any) {
      setError(err.message || "Erro ao carregar")
    }
    setLoading(false)
  }

  useEffect(() => { load(); const t = setInterval(load, 30_000); return () => clearInterval(t) }, [code])

  if (loading) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT2, fontFamily: "'Inter', system-ui, sans-serif" }}>
      Carregando…
    </div>
  )

  if (error) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", color: RED, fontFamily: "'Inter', system-ui, sans-serif" }}>
      ⚠️ {error}
    </div>
  )

  const { agency, clients, summary } = data

  const filtered = clients.filter((c: any) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.city?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "todos" ? true : filter === "online" ? c.online : filter === "offline" ? !c.online : true
    return matchSearch && matchFilter
  })

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input::placeholder { color: #4B5563; } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      {/* NAV */}
      <nav style={{ background: "rgba(11,16,32,0.95)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${BORDER}`, padding: "0 1.5rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#3B82F6,#6366F1)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 800 }}>DOOH<span style={{ color: BLUE }}>PLAY</span></span>
          </Link>
          <span style={{ color: MUTED }}>/</span>
          <span style={{ fontSize: 13, color: TEXT2 }}>Agência</span>
          <span style={{ fontSize: 12, color: TEXT2, background: BORDER, padding: "2px 8px", borderRadius: 10 }}>{agency.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>● {summary.online} online</span>
          <button onClick={load} style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 12px", color: TEXT2, fontSize: 12, cursor: "pointer" }}>↻</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* HEADER */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 4 }}>{agency.name}</h1>
          <div style={{ fontSize: 13, color: TEXT2 }}>Painel de gerenciamento · {agency.email} · {agency.phone}</div>
        </div>

        {/* KPIs */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <KpiCard label="Total de telas"  value={String(summary.total)}       icon="📺"  />
          <KpiCard label="Online agora"    value={String(summary.online)}      icon="🟢" color={GREEN}  />
          <KpiCard label="Offline"         value={String(summary.offline)}     icon="🔴" color={summary.offline > 0 ? RED : MUTED} />
          <KpiCard label="MRR total"       value={brl(summary.revenue_mrr)}    icon="💵" color={GREEN}  />
          <KpiCard label="Exibições hoje"  value={fmt(summary.plays_today)}    icon="👁" color={BLUE}   />
          <KpiCard label="Exibições/mês"   value={fmt(summary.plays_month)}    icon="📊" color={PURPLE} />
        </div>

        {/* FILTROS */}
        <div style={{ display: "flex", gap: 10, marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Buscar cliente ou cidade…"
            style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 14px", color: TEXT, fontSize: 13, outline: "none", minWidth: 260 }}
          />
          {["todos", "online", "offline"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer",
              background: filter === f ? BLUE : "transparent",
              border: `1px solid ${filter === f ? BLUE : BORDER}`,
              color: filter === f ? "#fff" : TEXT2,
            }}>
              {f === "todos" ? "Todos" : f === "online" ? "🟢 Online" : "🔴 Offline"}
            </button>
          ))}
          <span style={{ fontSize: 12, color: TEXT2, marginLeft: "auto" }}>{filtered.length} cliente{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* LISTA DE CLIENTES */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", background: SURFACE, borderRadius: 12, border: `1px dashed ${BORDER}`, color: TEXT2 }}>
              Nenhum cliente encontrado.
            </div>
          )}
          {filtered.map((c: any) => (
            <div key={c.code} style={{ background: SURFACE, border: `1px solid ${c.online ? GREEN + "33" : BORDER}`, borderRadius: 12, padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr auto auto auto auto auto", alignItems: "center", gap: 16 }}>

              {/* Info */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.online ? GREEN : MUTED, display: "inline-block", animation: c.online ? "pulse 2s infinite" : "none" }} />
                  <span style={{ fontWeight: 700, color: TEXT, fontSize: 14 }}>{c.name}</span>
                  <span style={{ fontSize: 11, color: TEXT2, background: BORDER, padding: "1px 7px", borderRadius: 10 }}>{c.code}</span>
                </div>
                <div style={{ fontSize: 12, color: TEXT2 }}>
                  {c.business_type ?? "—"} · {c.city ?? c.address ?? "Sem localização"}
                  {c.last_ping && <span style={{ marginLeft: 8, color: MUTED }}>· {timeSince(c.last_ping)}</span>}
                </div>
              </div>

              {/* Status */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>Status</div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: c.online ? GREEN + "22" : MUTED + "22", color: c.online ? GREEN : MUTED, border: `1px solid ${c.online ? GREEN + "44" : MUTED + "44"}` }}>
                  {c.online ? "Online" : "Offline"}
                </span>
              </div>

              {/* Plano */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>Plano</div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: BLUE + "22", color: BLUE, border: `1px solid ${BLUE}44` }}>
                  {c.plan ?? "—"}
                </span>
              </div>

              {/* Receita */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>Receita/mês</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: GREEN }}>{brl(c.revenue_month || 0)}</div>
              </div>

              {/* Exibições */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>Hoje</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{fmt(c.plays_today || 0)}</div>
              </div>

              {/* Ações */}
              <div style={{ display: "flex", gap: 8 }}>
                <Link href={`/dashboard/local/${c.code}`} target="_blank" style={{ fontSize: 12, color: PURPLE, textDecoration: "none", padding: "5px 10px", border: `1px solid ${PURPLE}44`, borderRadius: 6 }}>
                  Dashboard
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
