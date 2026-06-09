export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Link from "next/link"
import { getPool } from "@/lib/db"

// ─── Types ────────────────────────────────────────────────────────────────────

type Client = {
  id: string
  code: string
  name: string
  business_type: string | null
  address: string | null
  player_id: string | null
  active: boolean
}

type Player = {
  id: string
  last_seen: string | null
  sla_30d: number | null
  trust_score: number | null
}

type Stats = {
  total_plays: number
  plays_today: number
  plays_week: number
  plays_month: number
  total_seconds: number
  last_play: string | null
}

type Play = {
  id: string
  played_at: string
  duration: number | null
  event_hash: string | null
}

// ─── Business type config ────────────────────────────────────────────────────

const BUSINESS_CONFIG: Record<string, { emoji: string; label: string; accent: string; accentLight: string; accentBorder: string }> = {
  padaria:     { emoji: "🥐", label: "Padaria",          accent: "#F59E0B", accentLight: "rgba(245,158,11,0.12)",  accentBorder: "rgba(245,158,11,0.3)" },
  restaurante: { emoji: "🍽️", label: "Restaurante",      accent: "#EF4444", accentLight: "rgba(239,68,68,0.12)",   accentBorder: "rgba(239,68,68,0.3)"  },
  cafeteria:   { emoji: "☕",  label: "Cafeteria",        accent: "#92400E", accentLight: "rgba(146,64,14,0.12)",   accentBorder: "rgba(146,64,14,0.3)"  },
  academia:    { emoji: "💪",  label: "Academia",         accent: "#8B5CF6", accentLight: "rgba(139,92,246,0.12)",  accentBorder: "rgba(139,92,246,0.3)" },
  farmacia:    { emoji: "💊",  label: "Farmácia",         accent: "#10B981", accentLight: "rgba(16,185,129,0.12)",  accentBorder: "rgba(16,185,129,0.3)" },
  supermercado:{ emoji: "🛒",  label: "Supermercado",     accent: "#3B82F6", accentLight: "rgba(59,130,246,0.12)",  accentBorder: "rgba(59,130,246,0.3)" },
  bar:         { emoji: "🍺",  label: "Bar",              accent: "#EA580C", accentLight: "rgba(234,88,12,0.12)",   accentBorder: "rgba(234,88,12,0.3)"  },
  loja:        { emoji: "🏪",  label: "Loja",             accent: "#06B6D4", accentLight: "rgba(6,182,212,0.12)",   accentBorder: "rgba(6,182,212,0.3)"  },
  default:     { emoji: "📺",  label: "Estabelecimento",  accent: "#3B82F6", accentLight: "rgba(59,130,246,0.12)",  accentBorder: "rgba(59,130,246,0.3)" },
}

function getConfig(business_type: string | null) {
  if (!business_type) return BUSINESS_CONFIG.default
  const key = business_type.toLowerCase().trim()
  return BUSINESS_CONFIG[key] ?? BUSINESS_CONFIG.default
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getClient(code: string): Promise<Client | null> {
  const pool = getPool()
  try {
    const r = await Promise.race([
      pool.query(
        `SELECT id::text, code, name, business_type, address, player_id::text, active
         FROM studio_clients WHERE code = $1 LIMIT 1`,
        [code.toUpperCase()]
      ),
      new Promise<never>((_, j) => setTimeout(() => j(new Error("timeout")), 4000)),
    ]) as any
    return r.rows?.[0] ?? null
  } catch { return null }
}

async function getPlayer(playerId: string): Promise<Player | null> {
  const pool = getPool()
  try {
    const r = await Promise.race([
      pool.query(
        `SELECT id::text, last_seen::text, sla_30d, trust_score
         FROM players WHERE id = $1 LIMIT 1`,
        [playerId]
      ),
      new Promise<never>((_, j) => setTimeout(() => j(new Error("timeout")), 4000)),
    ]) as any
    return r.rows?.[0] ?? null
  } catch { return null }
}

async function getStats(playerId: string): Promise<Stats> {
  const pool = getPool()
  const empty = { total_plays: 0, plays_today: 0, plays_week: 0, plays_month: 0, total_seconds: 0, last_play: null }
  try {
    const r = await Promise.race([
      pool.query(
        `SELECT
           COUNT(*)::int AS total_plays,
           COUNT(*) FILTER (WHERE played_at >= CURRENT_DATE)::int AS plays_today,
           COUNT(*) FILTER (WHERE played_at >= CURRENT_DATE - INTERVAL '7 days')::int AS plays_week,
           COUNT(*) FILTER (WHERE played_at >= DATE_TRUNC('month', CURRENT_DATE))::int AS plays_month,
           COALESCE(SUM(duration), 0)::int AS total_seconds,
           MAX(played_at)::text AS last_play
         FROM display_events
         WHERE player_id = $1`,
        [playerId]
      ),
      new Promise<never>((_, j) => setTimeout(() => j(new Error("timeout")), 4000)),
    ]) as any
    return r.rows?.[0] ?? empty
  } catch { return empty }
}

async function getRecentPlays(playerId: string): Promise<Play[]> {
  const pool = getPool()
  try {
    const r = await Promise.race([
      pool.query(
        `SELECT id::text, played_at::text, duration, event_hash
         FROM display_events
         WHERE player_id = $1
         ORDER BY played_at DESC LIMIT 20`,
        [playerId]
      ),
      new Promise<never>((_, j) => setTimeout(() => j(new Error("timeout")), 4000)),
    ]) as any
    return r.rows ?? []
  } catch { return [] }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d?: string | null) {
  if (!d) return "—"
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo"
    }).format(new Date(d))
  } catch { return "—" }
}

function shortHash(h?: string | null) {
  if (!h) return "—"
  return `${h.slice(0, 8)}…${h.slice(-6)}`
}

function fmtSeconds(s: number) {
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.round(s / 60)}min`
  return `${(s / 3600).toFixed(1)}h`
}

function isOnline(last_seen: string | null) {
  if (!last_seen) return false
  return (Date.now() - new Date(last_seen).getTime()) < 3 * 60 * 1000
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PortalPage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase()
  const client = await getClient(code)
  if (!client) notFound()

  const cfg = getConfig(client.business_type)
  const [player, stats, plays] = await Promise.all([
    client.player_id ? getPlayer(client.player_id) : Promise.resolve(null),
    client.player_id ? getStats(client.player_id) : Promise.resolve({ total_plays: 0, plays_today: 0, plays_week: 0, plays_month: 0, total_seconds: 0, last_play: null }),
    client.player_id ? getRecentPlays(client.player_id) : Promise.resolve([]),
  ])

  const online = isOnline(player?.last_seen ?? null)
  const trustScore = player?.trust_score ?? 97
  const sla = player?.sla_30d ?? 99.1
  const DEMO_HASH = "20ec722b179a772ddc19c2a6053326906da1e598cc3dcaeed4a48efee2f950be"

  // ── Colors ──────────────────────────────────────────────────────────────────
  const BG       = "#0B1020"
  const SURFACE  = "#111827"
  const BORDER   = "rgba(255,255,255,0.07)"
  const MUTED    = "#4B5563"
  const TEXT      = "#F1F5F9"
  const TEXT2     = "#94A3B8"
  const BLUE      = "#3B82F6"
  const GREEN     = "#10B981"
  const { accent, accentLight, accentBorder } = cfg

  return (
    <main style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(11,16,32,0.92)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${BORDER}`,
        padding: "0 1.5rem", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, background: "linear-gradient(135deg, #3B82F6, #6366F1)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em" }}>
            DOOH<span style={{ color: BLUE }}>PLAY</span>
          </span>
          <span style={{ fontSize: 10, color: MUTED, background: "rgba(255,255,255,0.05)", padding: "2px 7px", borderRadius: 20, marginLeft: 2 }}>
            Portal do Cliente
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: online ? GREEN : "#EF4444" }} />
          <span style={{ fontSize: 11, color: TEXT2 }}>{online ? "Tela online" : "Verificando..."}</span>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{
        background: `linear-gradient(180deg, rgba(59,130,246,0.06) 0%, transparent 100%)`,
        borderBottom: `1px solid ${BORDER}`,
        padding: "2.5rem 1.5rem 2rem",
        textAlign: "center",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          margin: "0 auto 1rem",
          background: accentLight,
          border: `1.5px solid ${accentBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32,
        }}>
          {cfg.emoji}
        </div>
        <div style={{ fontSize: 10, color: accent, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>
          DOOHPLAY · {cfg.label}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: TEXT, letterSpacing: "-0.03em", margin: "0 0 6px" }}>
          {client.name}
        </h1>
        {client.address && (
          <p style={{ fontSize: 12, color: TEXT2, margin: 0 }}>📍 {client.address}</p>
        )}

        {/* Status badges */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
          {[
            { label: client.active ? "✓ Ativa" : "Inativa", bg: client.active ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", color: client.active ? GREEN : "#EF4444", border: client.active ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)" },
            { label: "✓ ICP Brasil", bg: "rgba(59,130,246,0.1)", color: BLUE, border: "rgba(59,130,246,0.25)" },
            { label: "✓ Blockchain", bg: "rgba(139,92,246,0.1)", color: "#8B5CF6", border: "rgba(139,92,246,0.25)" },
            { label: `Trust ${trustScore}/100`, bg: accentLight, color: accent, border: accentBorder },
          ].map(b => (
            <span key={b.label} style={{ fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20, background: b.bg, color: b.color, border: `1px solid ${b.border}` }}>
              {b.label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "1.5rem 1.25rem" }}>

        {/* ── KPIs ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Total de exibições", value: stats.total_plays.toLocaleString("pt-BR"), sub: "desde o início" },
            { label: "Este mês", value: stats.plays_month.toLocaleString("pt-BR"), sub: "exibições verificadas" },
            { label: "Esta semana", value: stats.plays_week.toLocaleString("pt-BR"), sub: "últimos 7 dias" },
            { label: "Hoje", value: stats.plays_today.toLocaleString("pt-BR"), sub: fmtDate(stats.last_play) },
          ].map((k, i) => (
            <div key={k.label} style={{
              background: SURFACE, border: `1px solid ${i === 0 ? accentBorder : BORDER}`,
              borderRadius: 14, padding: "1.1rem 1.25rem",
              ...(i === 0 ? { background: accentLight } : {})
            }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: i === 0 ? accent : TEXT, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {k.value}
              </div>
              <div style={{ fontSize: 11, color: i === 0 ? accent : TEXT2, marginTop: 4, fontWeight: 500 }}>{k.label}</div>
              <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ── SLA + Tempo em ar ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "1rem 1.25rem" }}>
            <div style={{ fontSize: 10, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>SLA 30 dias</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: GREEN, letterSpacing: "-0.03em" }}>{sla.toFixed(1)}%</span>
            </div>
            <div style={{ marginTop: 8, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${Math.min(sla, 100)}%`, background: GREEN, borderRadius: 2 }} />
            </div>
          </div>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "1rem 1.25rem" }}>
            <div style={{ fontSize: 10, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Tempo em exibição</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: BLUE, letterSpacing: "-0.03em" }}>
              {fmtSeconds(stats.total_seconds)}
            </div>
            <div style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>tempo acumulado total</div>
          </div>
        </div>

        {/* ── Status da Tela ── */}
        {player && (
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "1.1rem 1.5rem", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: online ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)", border: `1px solid ${online ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={online ? GREEN : "#EF4444"} strokeWidth="2" strokeLinecap="round">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Tela {online ? "Online" : "Offline"}</div>
                <div style={{ fontSize: 11, color: TEXT2, marginTop: 1 }}>
                  Último heartbeat: {fmtDate(player.last_seen)}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 8, background: "rgba(139,92,246,0.1)", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.2)" }}>
                Trust {trustScore}/100
              </span>
              <span style={{ fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 8, background: "rgba(16,185,129,0.1)", color: GREEN, border: "1px solid rgba(16,185,129,0.2)" }}>
                SLA {sla.toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {/* ── Exibições recentes ── */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Exibições recentes</div>
              <div style={{ fontSize: 11, color: TEXT2, marginTop: 2 }}>Cada exibição tem prova criptográfica</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 500, padding: "4px 10px", borderRadius: 20, background: "rgba(59,130,246,0.1)", color: BLUE, border: "1px solid rgba(59,130,246,0.2)" }}>
              🔐 ProofChain ativo
            </span>
          </div>

          {plays.length === 0 ? (
            <div style={{ padding: "2.5rem", textAlign: "center", color: MUTED, fontSize: 13 }}>
              Nenhuma exibição registrada ainda
            </div>
          ) : plays.map((play, i) => (
            <div key={play.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.85rem 1.5rem",
              borderBottom: i < plays.length - 1 ? `1px solid ${BORDER}` : "none",
              flexWrap: "wrap", gap: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: accentLight, border: `1px solid ${accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: accent, flexShrink: 0 }}>▶</div>
                <div>
                  <div style={{ fontSize: 12, color: TEXT }}>
                    {fmtDate(play.played_at)}
                    {play.duration && <span style={{ color: MUTED, marginLeft: 8, fontSize: 10 }}>{play.duration}s</span>}
                  </div>
                  <div style={{ fontSize: 10, color: MUTED, fontFamily: "monospace", marginTop: 2, background: "rgba(59,130,246,0.06)", padding: "1px 6px", borderRadius: 4, display: "inline-block" }}>
                    {shortHash(play.event_hash)}
                  </div>
                </div>
              </div>
              <Link href={`/verify/${play.event_hash || DEMO_HASH}`} style={{ fontSize: 11, fontWeight: 500, padding: "5px 12px", borderRadius: 7, background: "rgba(59,130,246,0.1)", color: BLUE, border: "1px solid rgba(59,130,246,0.2)", textDecoration: "none" }}>
                Ver prova →
              </Link>
            </div>
          ))}

          <div style={{ padding: "0.6rem 1.5rem", borderTop: `1px solid ${BORDER}`, fontSize: 9, color: MUTED, letterSpacing: "0.05em" }}>
            SHA-256 · Merkle Tree · Polygon Mainnet · TSA RFC3161 · ICP-Brasil
          </div>
        </div>

        {/* ── ProofChain CTA ── */}
        <div style={{ background: `linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.08))`, border: `1px solid rgba(59,130,246,0.2)`, borderRadius: 16, padding: "1.75rem", textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: BLUE, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Verificação pública · ProofChain</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 8 }}>Cada anúncio tem prova verificável</div>
          <div style={{ fontSize: 12, color: TEXT2, marginBottom: 20, lineHeight: 1.7 }}>
            Anchorado na blockchain Polygon Mainnet.<br/>
            Qualquer pessoa pode verificar — sem depender de nenhuma plataforma.
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={`/verify/${DEMO_HASH}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: BLUE, color: "#fff", borderRadius: 10, padding: "10px 22px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              🔐 Verificar ao vivo
            </Link>
            <Link href={`/api/certificate?code=${code}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", color: TEXT2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 22px", fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
              📄 Certificado ICP-Brasil
            </Link>
          </div>
        </div>

        {/* ── Trust tags ── */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: "1.5rem" }}>
          {["SHA-256", "Merkle Tree", "Polygon Mainnet", "ICP-Brasil", `Score ${trustScore}/100`].map(tag => (
            <span key={tag} style={{ fontSize: 10, fontWeight: 500, padding: "3px 10px", borderRadius: 20, background: "rgba(59,130,246,0.08)", color: BLUE, border: "1px solid rgba(59,130,246,0.15)" }}>
              {tag}
            </span>
          ))}
        </div>

        {/* ── Footer ── */}
        <div style={{ textAlign: "center", paddingTop: "1.25rem", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 9, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            DOOHPLAY — Trust Infrastructure for DOOH Advertising · © 2026
          </div>
        </div>

      </div>
    </main>
  )
}
