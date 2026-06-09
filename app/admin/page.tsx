"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const BG      = "#0B1020"
const SURFACE = "#111827"
const BORDER  = "#1F2937"
const TEXT    = "#F9FAFB"
const TEXT2   = "#9CA3AF"
const MUTED   = "#4B5563"
const BLUE    = "#3B82F6"
const GREEN   = "#10B981"
const AMBER   = "#F59E0B"
const RED     = "#EF4444"
const PURPLE  = "#8B5CF6"

const fmt = (d?: string | null) => {
  if (!d) return "—"
  try { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(d)) }
  catch { return "—" }
}
const brl = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n ?? 0)

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: color + "22", color, border: `1px solid ${color}44` }}>
      {label}
    </span>
  )
}

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px", flex: 1, minWidth: 160 }}>
      <div style={{ fontSize: 11, color: TEXT2, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color ?? TEXT }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// ── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (s: string) => void }) {
  const [secret, setSecret] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setLoading(true)
    setError("")
    const res = await fetch(`/api/admin/stats?secret=${encodeURIComponent(secret)}`)
    if (res.ok) {
      localStorage.setItem("admin_secret", secret)
      onLogin(secret)
    } else {
      setError("Senha incorreta.")
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "2.5rem", width: 360 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg,${BLUE},${PURPLE})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>D</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>DOOHPLAY</div>
            <div style={{ fontSize: 11, color: TEXT2 }}>Painel Admin</div>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, color: TEXT2, marginBottom: 6 }}>SENHA DE ACESSO</label>
          <input
            type="password"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handle()}
            placeholder="••••••••••••"
            style={{ width: "100%", boxSizing: "border-box", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", color: TEXT, fontSize: 14, outline: "none" }}
          />
        </div>
        {error && <div style={{ fontSize: 12, color: RED, marginBottom: 12 }}>{error}</div>}
        <button
          onClick={handle}
          disabled={loading || !secret}
          style={{ width: "100%", background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "11px", fontSize: 14, fontWeight: 600, cursor: loading || !secret ? "not-allowed" : "pointer", opacity: loading || !secret ? 0.7 : 1 }}
        >
          {loading ? "Verificando…" : "Entrar"}
        </button>
      </div>
    </div>
  )
}

// ── Aba Clientes ─────────────────────────────────────────────────────────────
function TabClientes({ data }: { data: any }) {
  const { clients, subscriptions } = data
  const subMap = Object.fromEntries(subscriptions.map((s: any) => [s.code, s]))

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 20 }}>Clientes <span style={{ fontSize: 13, color: TEXT2, fontWeight: 400 }}>({clients.length})</span></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {clients.map((c: any) => {
          const sub = subMap[c.code]
          return (
            <div key={c.code} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr auto auto auto auto", alignItems: "center", gap: 20 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: TEXT, fontSize: 15 }}>{c.name}</span>
                  <span style={{ fontSize: 11, color: TEXT2, background: BORDER, padding: "1px 7px", borderRadius: 10 }}>{c.code}</span>
                </div>
                <div style={{ fontSize: 12, color: TEXT2 }}>{c.business_type} · {c.address ?? "Sem endereço"}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>Player</div>
                <Badge label={c.player_status ?? "offline"} color={c.player_status === "online" ? GREEN : MUTED} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>Plano</div>
                <Badge label={sub?.plan ?? "—"} color={sub ? BLUE : MUTED} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>Assinatura</div>
                <Badge label={sub?.status ?? "sem assinatura"} color={sub?.status === "ACTIVE" ? GREEN : AMBER} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link href={`/portal/${c.code}`} target="_blank" style={{ fontSize: 12, color: BLUE, textDecoration: "none", padding: "5px 10px", border: `1px solid ${BLUE}44`, borderRadius: 6 }}>Portal</Link>
                <Link href={`/dashboard/local/${c.code}`} target="_blank" style={{ fontSize: 12, color: PURPLE, textDecoration: "none", padding: "5px 10px", border: `1px solid ${PURPLE}44`, borderRadius: 6 }}>Dashboard</Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Aba Assinaturas ───────────────────────────────────────────────────────────
function TabAssinaturas({ data }: { data: any }) {
  const { subscriptions, clients } = data
  const clientMap = Object.fromEntries(clients.map((c: any) => [c.code, c]))
  const mrr = subscriptions.filter((s: any) => s.status === "ACTIVE").reduce((a: number, s: any) => a + Number(s.value), 0)

  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <KpiCard label="MRR" value={brl(mrr)} color={GREEN} />
        <KpiCard label="Assinaturas Ativas" value={subscriptions.filter((s: any) => s.status === "ACTIVE").length} color={BLUE} />
        <KpiCard label="ARR Projetado" value={brl(mrr * 12)} color={PURPLE} />
        <KpiCard label="Ticket Médio" value={brl(subscriptions.length > 0 ? mrr / subscriptions.length : 0)} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Assinaturas</div>
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
              {["Cliente", "Plano", "Valor", "Status", "Asaas ID", "Criado em"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: TEXT2, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((s: any, i: number) => (
              <tr key={s.code} style={{ borderBottom: i < subscriptions.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontWeight: 600, color: TEXT }}>{clientMap[s.code]?.name ?? s.code}</div>
                  <div style={{ fontSize: 11, color: TEXT2 }}>{s.code}</div>
                </td>
                <td style={{ padding: "12px 16px" }}><Badge label={s.plan} color={BLUE} /></td>
                <td style={{ padding: "12px 16px", color: GREEN, fontWeight: 600 }}>{brl(s.value)}</td>
                <td style={{ padding: "12px 16px" }}><Badge label={s.status} color={s.status === "ACTIVE" ? GREEN : AMBER} /></td>
                <td style={{ padding: "12px 16px", fontSize: 11, color: TEXT2, fontFamily: "monospace" }}>{s.asaas_subscription_id ?? "—"}</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: TEXT2 }}>{fmt(s.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Aba Anunciantes ───────────────────────────────────────────────────────────
function TabAnunciantes({ data }: { data: any }) {
  const { advertisers, campaigns } = data
  const campByAdv = campaigns.reduce((acc: any, c: any) => {
    acc[c.advertiserCode] = (acc[c.advertiserCode] ?? 0) + 1
    return acc
  }, {})

  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <KpiCard label="Anunciantes" value={advertisers.length} color={BLUE} />
        <KpiCard label="Campanhas" value={campaigns.length} color={PURPLE} />
        <KpiCard label="Campanhas Ativas" value={campaigns.filter((c: any) => c.status === "active").length} color={GREEN} />
        <KpiCard label="Invest. Total" value={brl(campaigns.reduce((a: number, c: any) => a + Number(c.budget ?? 0), 0))} color={AMBER} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Anunciantes</div>
      {advertisers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", background: SURFACE, borderRadius: 12, border: `1px dashed ${BORDER}`, color: TEXT2 }}>Nenhum anunciante cadastrado.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {advertisers.map((a: any) => (
            <div key={a.id} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr auto auto auto", alignItems: "center", gap: 20 }}>
              <div>
                <div style={{ fontWeight: 600, color: TEXT, marginBottom: 4 }}>{a.name}</div>
                <div style={{ fontSize: 12, color: TEXT2 }}>{a.email ?? "—"} · {a.phone ?? "—"}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: PURPLE }}>{campByAdv[a.code] ?? 0}</div>
                <div style={{ fontSize: 11, color: TEXT2 }}>Campanhas</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 11, color: TEXT2, background: BORDER, padding: "2px 8px", borderRadius: 10 }}>#{a.code}</span>
              </div>
              <Link href={`/anunciante/${a.code}`} target="_blank" style={{ fontSize: 12, color: BLUE, textDecoration: "none", padding: "5px 10px", border: `1px solid ${BLUE}44`, borderRadius: 6 }}>Portal</Link>
            </div>
          ))}
        </div>
      )}

      {campaigns.length > 0 && (
        <>
          <div style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: "28px 0 16px" }}>Campanhas Recentes</div>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {["Campanha", "Anunciante", "Período", "Telas", "Budget", "Status"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: TEXT2, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c: any, i: number) => (
                  <tr key={c.id} style={{ borderBottom: i < campaigns.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: TEXT }}>{c.name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: TEXT2 }}>{c.advertiserCode}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: TEXT2 }}>{fmt(c.startDate)} → {fmt(c.endDate)}</td>
                    <td style={{ padding: "12px 16px", color: TEXT }}>{c.screen_count}</td>
                    <td style={{ padding: "12px 16px", color: GREEN, fontWeight: 600 }}>{brl(c.budget)}</td>
                    <td style={{ padding: "12px 16px" }}><Badge label={c.status} color={c.status === "active" ? GREEN : AMBER} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

// ── Aba Eventos ───────────────────────────────────────────────────────────────
function TabEventos({ data }: { data: any }) {
  const { events, blocks } = data
  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <KpiCard label="Total de Eventos" value={events.total?.toLocaleString("pt-BR")} color={BLUE} />
        <KpiCard label="Últimas 24h" value={events.last_24h?.toLocaleString("pt-BR")} color={GREEN} />
        <KpiCard label="Últimos 7 dias" value={events.last_7d?.toLocaleString("pt-BR")} color={PURPLE} />
        <KpiCard label="Blocos Totais" value={blocks.total?.toLocaleString("pt-BR")} />
        <KpiCard label="Blocos Ancorados" value={blocks.anchored?.toLocaleString("pt-BR")} color={AMBER} sub={`${Math.round((blocks.anchored / blocks.total) * 100) || 0}% do total`} />
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <Link href="/explorer" target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: SURFACE, border: `1px solid ${BORDER}`, color: TEXT, textDecoration: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13 }}>
          🔍 Abrir ProofChain Explorer
        </Link>
        <Link href="/trust-center" target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: SURFACE, border: `1px solid ${BORDER}`, color: TEXT, textDecoration: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13 }}>
          🛡 Trust Center
        </Link>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [secret, setSecret] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState("clientes")

  useEffect(() => {
    const saved = localStorage.getItem("admin_secret")
    if (saved) tryLoad(saved)
  }, [])

  const tryLoad = async (s: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/stats?secret=${encodeURIComponent(s)}`)
      if (res.ok) { setData(await res.json()); setSecret(s) }
      else { localStorage.removeItem("admin_secret") }
    } catch {}
    setLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT2, fontFamily: "'Inter', system-ui, sans-serif" }}>
      Carregando…
    </div>
  )

  if (!secret || !data) return <LoginScreen onLogin={s => tryLoad(s)} />

  const TABS = [
    { id: "clientes",     label: "Clientes",     icon: "👥", count: data.clients?.length },
    { id: "assinaturas",  label: "Assinaturas",  icon: "💳", count: data.subscriptions?.length },
    { id: "anunciantes",  label: "Anunciantes",  icon: "📢", count: data.advertisers?.length },
    { id: "eventos",      label: "Eventos",      icon: "⚡" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input::placeholder { color: #4B5563; }`}</style>

      {/* Header */}
      <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: `linear-gradient(135deg,${BLUE},${PURPLE})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>D</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>DOOHPLAY</div>
            <div style={{ fontSize: 11, color: TEXT2 }}>Painel Admin</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ fontSize: 12, color: TEXT2, textDecoration: "none" }}>← Site</Link>
          <button onClick={() => { localStorage.removeItem("admin_secret"); setSecret(null); setData(null) }}
            style={{ fontSize: 12, color: RED, background: "transparent", border: `1px solid ${RED}44`, borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
            Sair
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "0 24px", display: "flex", gap: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "transparent", border: "none", cursor: "pointer",
            padding: "14px 18px", fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
            color: tab === t.id ? BLUE : TEXT2,
            borderBottom: `2px solid ${tab === t.id ? BLUE : "transparent"}`,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            {t.icon} {t.label}
            {t.count !== undefined && (
              <span style={{ fontSize: 11, background: BORDER, color: TEXT2, padding: "1px 6px", borderRadius: 10 }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {tab === "clientes"    && <TabClientes    data={data} />}
        {tab === "assinaturas" && <TabAssinaturas data={data} />}
        {tab === "anunciantes" && <TabAnunciantes data={data} />}
        {tab === "eventos"     && <TabEventos     data={data} />}
      </div>
    </div>
  )
}
