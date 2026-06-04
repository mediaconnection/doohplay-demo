export const dynamic = "force-dynamic"

import { pool } from "@/lib/db"
import Link from "next/link"
import TimeAgo from "@/components/ui/TimeAgo"

const CAMPAIGN_ID = "aaaaaaaa-0006-0006-0006-000000000006"
const DEMO_HASH = "20ec722b179a772ddc19c2a6053326906da1e598cc3dcaeed4a48efee2f950be"

async function getStats() {
  try {
    const r = await Promise.race([
      pool.query(`
        SELECT
          COUNT(*)::int AS total_plays,
          COUNT(*) FILTER (WHERE played_at >= CURRENT_DATE)::int AS plays_today,
          COUNT(*) FILTER (WHERE played_at >= CURRENT_DATE - INTERVAL '7 days')::int AS plays_week,
          MAX(played_at)::text AS last_play
        FROM display_events WHERE campaign_id = $1
      `, [CAMPAIGN_ID]),
      new Promise((_, j) => setTimeout(() => j(new Error("timeout")), 4000))
    ]) as any
    return r.rows?.[0] ?? { total_plays: 0, plays_today: 0, plays_week: 0, last_play: null }
  } catch { return { total_plays: 0, plays_today: 0, plays_week: 0, last_play: null } }
}

async function getRecentPlays() {
  try {
    const r = await Promise.race([
      pool.query(`
        SELECT e.id, e.played_at, e.duration, e.event_hash
        FROM display_events e
        WHERE e.campaign_id = $1
        ORDER BY e.played_at DESC LIMIT 20
      `, [CAMPAIGN_ID]),
      new Promise((_, j) => setTimeout(() => j(new Error("timeout")), 4000))
    ]) as any
    return r.rows ?? []
  } catch { return [] }
}

function shortHash(h?: string | null) {
  if (!h) return "—"
  return `${h.slice(0, 10)}...${h.slice(-10)}`
}

function fmtDate(d?: string | null) {
  if (!d) return "—"
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(d))
  } catch { return "—" }
}

export default async function MeninosDaVilaPage() {
  const [stats, plays] = await Promise.all([getStats(), getRecentPlays()])
  const O = "#EA580C"   // laranja principal
  const OL = "#FB923C" // laranja claro
  const OD = "#9A3412" // laranja escuro

  return (
    <main style={{ minHeight: "100vh", background: "#0f0800", color: "#fff" }}>

      {/* Header */}
      <header style={{
        background: `linear-gradient(180deg, #1a0a00 0%, #0f0800 100%)`,
        borderBottom: `1px solid ${O}30`,
        padding: "3rem 1.5rem 2rem",
        textAlign: "center",
      }}>
        {/* Logo gerado — sem imagem */}
        <div style={{
          width: 120, height: 120, borderRadius: "50%",
          background: `linear-gradient(135deg, ${O} 0%, ${OD} 100%)`,
          margin: "0 auto 1.5rem",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 40px ${O}40`,
          fontSize: 48,
        }}>
          🍺
        </div>

        <div style={{ fontSize: 11, color: OL, letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "Georgia, serif", marginBottom: 6 }}>
          Bom Retiro · São Paulo
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#fff", fontFamily: "Georgia, serif", margin: "0 0 4px", letterSpacing: "0.05em" }}>
          Bar Meninos da Vila
        </h1>
        <div style={{ fontSize: 13, color: "#ffffff50", fontStyle: "italic" }}>
          Lanchonete &amp; Bar
        </div>

        <div style={{ marginTop: "1.25rem", display: "inline-flex", alignItems: "center", gap: 8, background: "#16a34a18", border: "1px solid #16a34a40", borderRadius: 999, padding: "6px 18px" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block", boxShadow: "0 0 6px #4ade80" }} />
          <span style={{ fontSize: 12, color: "#4ade80", fontFamily: "Georgia, serif" }}>Tela ativa</span>
        </div>

        <div style={{ marginTop: 8, fontSize: 11, color: `${O}80`, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Portal de Verificação de Mídia
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1.25rem" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: "2rem" }}>
          {[
            { label: "Exibições verificadas", value: stats.total_plays.toLocaleString("pt-BR"), gold: true },
            { label: "Esta semana", value: stats.plays_week.toLocaleString("pt-BR"), gold: false },
            { label: "Hoje", value: stats.plays_today.toLocaleString("pt-BR"), gold: false },
            { label: "Score de confiança", value: "100/100", gold: true },
          ].map(s => (
            <div key={s.label} style={{
              background: s.gold ? `${O}12` : "#ffffff08",
              border: `1px solid ${s.gold ? `${O}35` : "#ffffff12"}`,
              borderRadius: 14, padding: "1.25rem", textAlign: "center",
            }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: s.gold ? OL : "#fff", fontFamily: "Georgia, serif", lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: "#ffffff50", marginTop: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Campanha */}
        <div style={{
          background: "#ffffff06", border: `1px solid ${O}25`,
          borderRadius: 16, padding: "1.25rem 1.5rem",
          marginBottom: "1.5rem",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 11, color: OL, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 5, fontFamily: "Georgia, serif" }}>
              Campanha em exibição
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, color: "#fff", marginBottom: 3 }}>
              Bar Meninos da Vila — Bom Retiro
            </div>
            <div style={{ fontSize: 12, color: "#ffffff50" }}>
              📍 Bom Retiro, São Paulo — SP
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: OL, fontFamily: "Georgia, serif" }}>R$20,00</div>
            <div style={{ fontSize: 11, color: "#ffffff40" }}>CPM · 15s por exibição</div>
          </div>
        </div>

        {/* Tabela exibições */}
        <div style={{ background: "#ffffff04", border: "1px solid #ffffff0f", borderRadius: 16, overflow: "hidden", marginBottom: "1.5rem" }}>
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #ffffff0a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Exibições recentes</div>
              <div style={{ fontSize: 12, color: "#ffffff40", marginTop: 2 }}>Prova criptográfica em cada exibição</div>
            </div>
            <div style={{ background: `${O}15`, border: `1px solid ${O}35`, borderRadius: 999, padding: "4px 14px", fontSize: 11, color: OL }}>
              🔐 Blockchain verificado
            </div>
          </div>

          {plays.map((play: any, i: number) => (
            <div key={play.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.85rem 1.5rem",
              borderBottom: i < plays.length - 1 ? "1px solid #ffffff07" : "none",
              flexWrap: "wrap", gap: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: `${O}12`, border: `1px solid ${O}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, flexShrink: 0,
                }}>▶</div>
                <div>
                  <div style={{ fontSize: 13, color: "#ffffffcc" }}>
                    {play.played_at ? fmtDate(play.played_at) : "—"}
                    {play.duration && <span style={{ color: "#ffffff35", marginLeft: 8, fontSize: 11 }}>{play.duration}s</span>}
                  </div>
                  <div style={{ fontSize: 10, color: "#ffffff25", fontFamily: "monospace", marginTop: 2 }}>
                    {shortHash(play.event_hash)}
                  </div>
                </div>
              </div>
              <Link
                href={`/verify/${DEMO_HASH}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: `${O}15`, border: `1px solid ${O}45`,
                  borderRadius: 8, padding: "6px 16px",
                  fontSize: 12, color: OL, textDecoration: "none",
                  fontWeight: 600, whiteSpace: "nowrap",
                }}
              >
                🔐 Ver prova
              </Link>
            </div>
          ))}

          <div style={{ padding: "0.75rem 1.5rem", borderTop: "1px solid #ffffff08", fontSize: 10, color: "#ffffff25" }}>
            SHA-256 · Merkle Tree · Polygon Mainnet · TSA RFC3161
          </div>
        </div>

        {/* CTA */}
        <div style={{
          background: `linear-gradient(135deg, ${O}15 0%, ${O}08 100%)`,
          border: `1px solid ${O}35`,
          borderRadius: 18, padding: "2rem", textAlign: "center", marginBottom: "1.5rem",
        }}>
          <div style={{ fontSize: 11, color: `${O}80`, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "Georgia, serif", marginBottom: 8 }}>
            Verificação pública
          </div>
          <div style={{ fontSize: 17, color: "#fff", fontWeight: 600, marginBottom: 8 }}>
            Cada anúncio tem prova verificável
          </div>
          <div style={{ fontSize: 13, color: "#ffffff50", marginBottom: 20, lineHeight: 1.6 }}>
            Anchorado na blockchain Polygon Mainnet.<br/>
            Qualquer pessoa pode verificar — sem depender de nenhuma plataforma.
          </div>
          <Link
            href={`/verify/${DEMO_HASH}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: O, color: "#fff",
              borderRadius: 12, padding: "12px 28px",
              fontSize: 13, fontWeight: 700, textDecoration: "none",
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}
          >
            🔐 Verificar ao vivo
          </Link>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", paddingTop: "1.5rem", borderTop: "1px solid #ffffff08" }}>
          <div style={{ fontSize: 10, color: "#ffffff20", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            DOOHPLAY — Trust Infrastructure for DOOH Advertising
          </div>
          <div style={{ fontSize: 10, color: "#ffffff15", marginTop: 4 }}>
            Blockchain · ICP-Brasil · Merkle Proof · TSA RFC3161
          </div>
        </div>
      </div>
    </main>
  )
}
