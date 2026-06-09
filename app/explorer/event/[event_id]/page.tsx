export const dynamic = "force-dynamic"

import Link from "next/link"
import { getPool } from "@/lib/db"

const BG      = "#080C18"
const SURFACE = "#0F1629"
const BORDER  = "rgba(255,255,255,0.07)"
const TEXT    = "#F1F5F9"
const TEXT2   = "#94A3B8"
const MUTED   = "#475569"
const BLUE    = "#3B82F6"
const GREEN   = "#10B981"

function fmt(d?: string | null) {
  if (!d) return "—"
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "long", timeStyle: "medium", timeZone: "America/Sao_Paulo"
    }).format(new Date(d))
  } catch { return "—" }
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, padding: "14px 0", borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ fontSize: 12, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", paddingTop: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: TEXT2, fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-all" }}>{value}</div>
    </div>
  )
}

export default async function EventPage({ params }: { params: Promise<{ event_id: string }> }) {
  const pool = getPool()
  const { event_id } = await params

  let event: any = null
  let error: string | null = null

  try {
    const res = await pool.query(`
      SELECT e.id::text, e.event_hash, e.screen_id::text, e.played_at,
             e.player_signature, e.asset_url, e.duration, e.previous_hash,
             e.merkle_batch_id::text, e.created_at,
             s.name AS screen_name, s.city, s.state, s.venue_name
      FROM display_events e
      LEFT JOIN screens s ON s.id = e.screen_id
      WHERE e.id = $1
    `, [event_id])

    if (res.rows.length === 0) {
      error = "Evento não encontrado."
    } else {
      event = res.rows[0]
    }
  } catch (err) {
    error = String(err)
  }

  return (
    <main style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <nav style={{
        background: "rgba(8,12,24,0.95)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${BORDER}`, padding: "0 1.5rem", height: 52,
        display: "flex", alignItems: "center", gap: 16,
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 26, height: 26, background: "linear-gradient(135deg,#3B82F6,#6366F1)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: TEXT, letterSpacing: "-0.02em" }}>DOOH<span style={{ color: BLUE }}>PLAY</span></span>
        </Link>
        <span style={{ color: MUTED }}>/</span>
        <Link href="/explorer" style={{ fontSize: 13, color: TEXT2, textDecoration: "none" }}>Explorer</Link>
        <span style={{ color: MUTED }}>/</span>
        <span style={{ fontSize: 13, color: MUTED }}>Evento</span>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {error ? (
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "3rem", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <div style={{ color: TEXT2 }}>{error}</div>
            <Link href="/explorer" style={{ display: "inline-block", marginTop: 20, color: BLUE, textDecoration: "none", fontSize: 14 }}>← Voltar ao Explorer</Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: GREEN + "22", color: GREEN, border: `1px solid ${GREEN}44` }}>
                  ⚡ Verified
                </span>
                <span style={{ fontSize: 12, color: MUTED }}>Display Event</span>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                Evento #{event.id.slice(0, 8)}…
              </h1>
              <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>{fmt(event.played_at)}</p>
            </div>

            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "0 1.5rem 0.5rem", marginBottom: "1.5rem" }}>
              <div style={{ padding: "1rem 0", borderBottom: `1px solid ${BORDER}`, fontSize: 14, fontWeight: 700, color: TEXT }}>Dados do Evento</div>
              <Row label="Event ID"      value={event.id}                   mono />
              <Row label="Event Hash"    value={event.event_hash ?? "—"}    mono />
              <Row label="Previous Hash" value={event.previous_hash ?? "—"} mono />
              <Row label="Played At"     value={fmt(event.played_at)}       />
              <Row label="Duration"      value={event.duration ? `${event.duration}s` : "—"} />
              <Row label="Asset URL"     value={event.asset_url ?? "—"}     mono />
            </div>

            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "0 1.5rem 0.5rem", marginBottom: "1.5rem" }}>
              <div style={{ padding: "1rem 0", borderBottom: `1px solid ${BORDER}`, fontSize: 14, fontWeight: 700, color: TEXT }}>Tela</div>
              <Row label="Screen ID" value={event.screen_id ?? "—"}   mono />
              <Row label="Nome"      value={event.screen_name ?? "—"} />
              <Row label="Local"     value={event.venue_name ?? "—"}  />
              <Row label="Cidade"    value={[event.city, event.state].filter(Boolean).join(", ") || "—"} />
            </div>

            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "0 1.5rem 0.5rem", marginBottom: "1.5rem" }}>
              <div style={{ padding: "1rem 0", borderBottom: `1px solid ${BORDER}`, fontSize: 14, fontWeight: 700, color: TEXT }}>Âncora Blockchain</div>
              <Row label="Merkle Batch ID"  value={event.merkle_batch_id ?? "—"}  mono />
              <Row label="Player Signature" value={event.player_signature ?? "—"} mono />
            </div>

            <Link href="/explorer" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: BLUE, textDecoration: "none", fontSize: 14 }}>
              ← Voltar ao Explorer
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
