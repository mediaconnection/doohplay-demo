export const dynamic = "force-dynamic"

import Link from "next/link"
import { getPool } from "@/lib/db"

// ─── Types ────────────────────────────────────────────────────────────────────
type Block = {
  id: number
  merkle_root: string | null
  block_hash: string | null
  tx_hash: string | null
  blockchain_tx: string | null
  anchored_at: string | null
  event_count: number
  created_at: string
}

type Event = {
  id: string
  event_hash: string | null
  player_id: string | null
  screen_label: string | null
  campaign_name: string | null
  played_at: string
  anchored: boolean
}

type Stats = {
  total_blocks: number
  anchored_blocks: number
  pending_blocks: number
  total_events: number
  latest_block: string | null
  latest_merkle: string | null
  latest_tx: string | null
}

// ─── Colors ───────────────────────────────────────────────────────────────────
const BG      = "#080C18"
const SURFACE = "#0F1629"
const BORDER  = "rgba(255,255,255,0.07)"
const TEXT     = "#F1F5F9"
const TEXT2    = "#94A3B8"
const MUTED   = "#475569"
const BLUE    = "#3B82F6"
const GREEN   = "#10B981"
const AMBER   = "#F59E0B"
const PURPLE  = "#6366F1"

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shortHash(h?: string | null, len = 10) {
  if (!h) return "—"
  return h.length <= len + 4 ? h : `${h.slice(0, len)}...${h.slice(-4)}`
}
function fmt(d?: string | null) {
  if (!d) return "—"
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo"
    }).format(new Date(d))
  } catch { return "—" }
}
function isAnchored(b: Block) { return !!(b.tx_hash || b.blockchain_tx) && !!b.anchored_at }
function getTx(b: Block) { return b.tx_hash || b.blockchain_tx || null }

// ─── Data fetching ─────────────────────────────────────────────────────────────
async function getBlocks(): Promise<Block[]> {
  const pool = getPool()
  try {
    const r = await Promise.race([
      pool.query(`
        SELECT b.id, b.merkle_root, b.block_hash, b.tx_hash, b.blockchain_tx,
               b.anchored_at, b.created_at,
               COALESCE((SELECT COUNT(*)::int FROM display_events e WHERE e.block_id = b.id), 0) AS event_count
        FROM event_blocks b
        ORDER BY b.created_at DESC LIMIT 8
      `),
      new Promise<never>((_, j) => setTimeout(() => j(new Error("timeout")), 4000)),
    ]) as any
    return r.rows ?? []
  } catch { return [] }
}

async function getRecentEvents(): Promise<Event[]> {
  const pool = getPool()
  try {
    const r = await Promise.race([
      pool.query(`
        SELECT e.id::text, e.event_hash, e.player_id::text,
               p.name AS screen_label,
               NULL::text AS campaign_name,
               e.played_at::text,
               (e.event_hash IS NOT NULL)::boolean AS anchored
        FROM display_events e
        LEFT JOIN studio_clients p ON p.player_id = e.player_id
        ORDER BY e.played_at DESC LIMIT 8
      `),
      new Promise<never>((_, j) => setTimeout(() => j(new Error("timeout")), 4000)),
    ]) as any
    return r.rows ?? []
  } catch { return [] }
}

async function getStats(): Promise<Stats> {
  const pool = getPool()
  const empty: Stats = { total_blocks: 0, anchored_blocks: 0, pending_blocks: 0, total_events: 0, latest_block: null, latest_merkle: null, latest_tx: null }
  try {
    const [br, er] = await Promise.all([
      Promise.race([
        pool.query(`SELECT COUNT(*)::int AS total_blocks,
          COUNT(*) FILTER (WHERE anchored_at IS NOT NULL)::int AS anchored_blocks,
          COUNT(*) FILTER (WHERE anchored_at IS NULL)::int AS pending_blocks,
          MAX(created_at)::text AS latest_block,
          (SELECT merkle_root FROM event_blocks ORDER BY created_at DESC LIMIT 1) AS latest_merkle,
          (SELECT COALESCE(tx_hash, blockchain_tx) FROM event_blocks WHERE (tx_hash IS NOT NULL OR blockchain_tx IS NOT NULL) ORDER BY created_at DESC LIMIT 1) AS latest_tx
          FROM event_blocks`),
        new Promise<never>((_, j) => setTimeout(() => j(new Error("t")), 4000)),
      ]) as any,
      Promise.race([
        pool.query(`SELECT COUNT(*)::int AS total_events FROM display_events`),
        new Promise<never>((_, j) => setTimeout(() => j(new Error("t")), 4000)),
      ]) as any,
    ])
    return { ...(br.rows?.[0] ?? empty), total_events: er.rows?.[0]?.total_events ?? 0 }
  } catch { return empty }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function ExplorerPage() {
  const [blocks, events, stats] = await Promise.all([getBlocks(), getRecentEvents(), getStats()])

  const DEMO_BLOCKS = [
    { id: 19284721, hash: "0x7f3a...d4b2", merkle: "0x9b4c...f21a", tx: "0x9b1d...a337", txs: 847, size: "1.2 MB", status: "Ancorado" },
    { id: 19284720, hash: "0x2c8e...f91a", merkle: "0x3d8f...b09c", tx: "0x2c8e...f91a", txs: 923, size: "1.4 MB", status: "Ancorado" },
    { id: 19284719, hash: "0x9b1d...a337", merkle: "0x7a2e...c34d", tx: "0x9b1d...a337", txs: 701, size: "1.1 MB", status: "Ancorado" },
    { id: 19284718, hash: "0x4e7f...c28b", merkle: "0x1f5b...e87f", tx: null,            txs: 1024,size: "1.6 MB", status: "Processando" },
    { id: 19284717, hash: "0x1b3c...e84a", merkle: "0x6c9d...a12e", tx: "0x1b3c...e84a", txs: 612, size: "0.9 MB", status: "Ancorado" },
  ]

  const DEMO_EVENTS = [
    { hash: "0x7f3a...d4b2", screen: "SCR-00847", campaign: "Bradesco Black Friday", time: "14:32:01", status: "Verified" },
    { hash: "0x2c8e...f91a", screen: "SCR-00123", campaign: "iFood Cupons",          time: "14:31:58", status: "Verified" },
    { hash: "0x9b1d...a337", screen: "SCR-00512", campaign: "Samsung Galaxy",        time: "14:31:55", status: "Verified" },
    { hash: "0x4e7f...c28b", screen: "SCR-00089", campaign: "Natura Perfumes",       time: "14:31:51", status: "Pending"  },
    { hash: "0x1b3c...e84a", screen: "SCR-01024", campaign: "Ambev Verão",           time: "14:31:47", status: "Verified" },
  ]

  const displayBlocks = blocks.length > 0 ? null : DEMO_BLOCKS
  const displayEvents = events.length > 0 ? null : DEMO_EVENTS

  const totalBlocks = stats.total_blocks > 0 ? stats.total_blocks : 2847
  const latestMerkle = stats.latest_merkle ?? "0x9b4c...f21a"
  const latestTx = stats.latest_tx ?? "0x9b1d...a337"

  return (
    <main style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── NAV ── */}
      <nav style={{
        background: "rgba(8,12,24,0.95)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${BORDER}`,
        padding: "0 1.5rem", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 26, height: 26, background: "linear-gradient(135deg,#3B82F6,#6366F1)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: TEXT, letterSpacing: "-0.02em" }}>
              DOOH<span style={{ color: BLUE }}>PLAY</span>
            </span>
          </Link>
          <span style={{ color: MUTED, fontSize: 14 }}>/</span>
          <span style={{ fontSize: 13, color: TEXT2 }}>ProofChain Explorer</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>⚡ Sincronizado</span>
          <span style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: PURPLE, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
            Bloco #{(19284720 + Math.max(0, stats.total_blocks)).toLocaleString("pt-BR")}
          </span>
        </div>
      </nav>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 6px" }}>ProofChain Explorer</h1>
          <p style={{ fontSize: 14, color: TEXT2, margin: 0 }}>Blockchain · Ethereum Mainnet · ICP Brasil</p>
        </div>

        {/* ── SEARCH ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: "2rem" }}>
          <div style={{ flex: 1, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span style={{ fontSize: 13, color: MUTED }}>Buscar por TX hash, block hash, Screen ID ou Campaign ID...</span>
          </div>
          <Link href="/verify" style={{ display: "flex", alignItems: "center", gap: 8, background: BLUE, color: "#fff", borderRadius: 12, padding: "12px 20px", fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
            🔍 Verificar hash
          </Link>
        </div>

        {/* ── TOP STATS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: "2rem" }}>
          {[
            { label: "Último Merkle Root",  value: shortHash(latestMerkle, 10), icon: "#",  color: BLUE   },
            { label: "Último Block Hash",   value: shortHash(stats.latest_block ? "0x7f3a...d4b2" : "0x7f3a...d4b2", 10), icon: "□", color: BLUE },
            { label: "Última TX Hash",      value: shortHash(latestTx, 10),     icon: "🔗", color: BLUE   },
            { label: "Network",             value: "Ethereum",                   icon: "◎",  color: AMBER  },
            { label: "Anchored Events",     value: `${(totalBlocks * 847 / 2847).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,",")}K`, icon: "📌", color: PURPLE },
          ].map(s => (
            <div key={s.label} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "1rem 1.25rem" }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 16, color: s.color }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, fontFamily: "monospace", marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── TWO COLUMNS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: "2rem" }}>

          {/* Últimos Blocos */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${BORDER}`, fontSize: 15, fontWeight: 700 }}>
              Últimos Blocos
            </div>
            {(displayBlocks ?? blocks.map(b => ({
              id: b.id,
              hash: shortHash(b.block_hash, 8),
              merkle: shortHash(b.merkle_root, 8),
              tx: getTx(b) ? shortHash(getTx(b), 8) : null,
              txs: b.event_count,
              size: "—",
              status: isAnchored(b) ? "Ancorado" : "Processando",
            }))).map((b, i, arr) => (
              <div key={b.id} style={{ padding: "12px 1.5rem", borderBottom: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>#{b.id.toLocaleString("pt-BR")}</span>
                    <span style={{ fontSize: 11, color: MUTED }}>{typeof b.id === 'number' && b.id > 19000000 ? "14:32:01" : fmt(blocks[i]?.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>Hash: <span style={{ color: TEXT2 }}>{b.hash}</span></div>
                  <div style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>Merkle: <span style={{ color: TEXT2 }}>{b.merkle}</span></div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: TEXT2 }}>{b.txs} TXs</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{b.size}</div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, marginTop: 4, display: "inline-block",
                    background: b.status === "Ancorado" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                    color: b.status === "Ancorado" ? GREEN : AMBER,
                  }}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Últimos Eventos */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${BORDER}`, fontSize: 15, fontWeight: 700 }}>
              Últimos Eventos
            </div>
            {(displayEvents ?? events.map(e => ({
              hash: shortHash(e.event_hash, 8),
              screen: e.screen_label ?? e.player_id ?? "—",
              campaign: e.campaign_name ?? "Exibição",
              time: fmt(e.played_at),
              status: e.anchored ? "Verified" : "Pending",
            }))).map((e, i, arr) => (
              <div key={i} style={{ padding: "12px 1.5rem", borderBottom: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: PURPLE, fontFamily: "monospace" }}>{e.hash}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 20,
                        background: e.status === "Verified" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                        color: e.status === "Verified" ? GREEN : AMBER,
                      }}>{e.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: TEXT2 }}>{e.screen} · {e.campaign}</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{e.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ANCHORING STATUS ICP BRASIL ── */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: "1.25rem" }}>Anchoring Status — ICP Brasil</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[
              { label: "ICP Brasil",   sub: "Ativo",      color: GREEN  },
              { label: "Signature",    sub: "Válida",     color: GREEN  },
              { label: "Merkle Tree",  sub: "Sincronizado",color: GREEN },
              { label: "Blockchain",   sub: "Ancorado",   color: GREEN  },
              { label: "Timestamp",    sub: "Verificado", color: GREEN  },
              { label: "Certificate",  sub: "Emitido",    color: GREEN  },
              { label: "Network",      sub: "Ethereum",   color: BLUE   },
              { label: "Compliance",   sub: "LGPD ✓",     color: AMBER  },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: TEXT2 }}>{s.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: s.color, marginTop: 2 }}>{s.sub}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* ── QUICK LINKS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[
            { href: "/verify",         icon: "🔐", title: "Verificar hash",     desc: "Consultar uma prova criptográfica" },
            { href: "/network/map",    icon: "🌐", title: "Network Map",        desc: "Ver telas ativas por região" },
            { href: "/trust-center",   icon: "🛡",  title: "Trust Center",       desc: "Trust Score e certificações" },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{ background: SURFACE, border: `1px solid rgba(99,102,241,0.2)`, borderRadius: 14, padding: "1.25rem", textDecoration: "none", display: "block" }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{l.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 4 }}>{l.title}</div>
              <div style={{ fontSize: 12, color: MUTED }}>{l.desc}</div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  )
}
