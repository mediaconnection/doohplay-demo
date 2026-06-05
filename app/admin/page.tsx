export const dynamic = "force-dynamic"

import { pool } from "@/lib/db"
import Link from "next/link"

// ── Types ──
type Screen = {
  id: string
  name: string
  location: string | null
  status: string
  last_ping: string | null
  plays_today: number
  plays_week: number
  client_name: string | null
  client_code: string | null
}

type Alert = {
  type: "offline" | "no_plays" | "error"
  screen_name: string
  message: string
  since: string | null
}

type Stats = {
  total_screens: number
  online_screens: number
  offline_screens: number
  total_plays_today: number
  total_plays_week: number
  active_campaigns: number
  total_clients: number
}

// ── Data fetchers ──
async function getStats(): Promise<Stats> {
  try {
    const [screenRes, playsRes, campaignRes, clientRes] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE last_ping IS NOT NULL AND last_ping >= NOW() - INTERVAL '5 minutes')::int AS online
        FROM players
      `),
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE played_at >= CURRENT_DATE)::int AS today,
          COUNT(*) FILTER (WHERE played_at >= CURRENT_DATE - INTERVAL '7 days')::int AS week
        FROM display_events
      `),
      pool.query(`SELECT COUNT(*)::int AS total FROM campaigns WHERE is_active = true`),
      pool.query(`SELECT COUNT(*)::int AS total FROM studio_clients WHERE active = true`),
    ])
    const s = screenRes.rows[0]
    const p = playsRes.rows[0]
    return {
      total_screens: s.total ?? 0,
      online_screens: s.online ?? 0,
      offline_screens: (s.total ?? 0) - (s.online ?? 0),
      total_plays_today: p.today ?? 0,
      total_plays_week: p.week ?? 0,
      active_campaigns: campaignRes.rows[0]?.total ?? 0,
      total_clients: clientRes.rows[0]?.total ?? 0,
    }
  } catch { return { total_screens: 0, online_screens: 0, offline_screens: 0, total_plays_today: 0, total_plays_week: 0, active_campaigns: 0, total_clients: 0 } }
}

async function getScreens(): Promise<Screen[]> {
  try {
    const res = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.location,
        CASE WHEN p.last_ping >= NOW() - INTERVAL '5 minutes' THEN 'online' ELSE 'offline' END AS status,
        p.last_ping::text,
        COUNT(e.id) FILTER (WHERE e.played_at >= CURRENT_DATE)::int AS plays_today,
        COUNT(e.id) FILTER (WHERE e.played_at >= CURRENT_DATE - INTERVAL '7 days')::int AS plays_week,
        sc.name AS client_name,
        sc.code AS client_code
      FROM players p
      LEFT JOIN display_events e ON e.player_id = p.id
      LEFT JOIN studio_clients sc ON sc.player_id = p.id
      GROUP BY p.id, p.name, p.location, p.last_ping, sc.name, sc.code
      ORDER BY status ASC, plays_today DESC
    `)
    return res.rows ?? []
  } catch { return [] }
}

async function getAlerts(): Promise<Alert[]> {
  try {
    const alerts: Alert[] = []

    // Telas offline há mais de 1 hora
    const offlineRes = await pool.query(`
      SELECT name, last_ping::text
      FROM players
      WHERE (last_ping IS NULL OR last_ping < NOW() - INTERVAL '1 hour') AND is_active = true
      LIMIT 10
    `)
    for (const r of offlineRes.rows) {
      alerts.push({ type: "offline", screen_name: r.name, message: "Tela offline", since: r.last_ping })
    }

    // Telas sem exibições hoje
    const noPlaysRes = await pool.query(`
      SELECT p.name, p.last_ping::text
      FROM players p
      WHERE p.last_ping IS NOT NULL AND p.last_ping >= NOW() - INTERVAL '5 minutes'
      AND NOT EXISTS (
        SELECT 1 FROM display_events e
        WHERE e.player_id = p.id AND e.played_at >= CURRENT_DATE
      )
      LIMIT 5
    `)
    for (const r of noPlaysRes.rows) {
      alerts.push({ type: "no_plays", screen_name: r.name, message: "Online mas sem exibições hoje", since: r.last_ping })
    }

    return alerts
  } catch { return [] }
}

async function getRecentActivity() {
  try {
    const res = await pool.query(`
      SELECT
        e.played_at::text,
        e.duration,
        p.name AS player_name,
        p.location AS player_location,
        c.name AS campaign_name,
        sc.name AS client_name
      FROM display_events e
      LEFT JOIN players p ON p.id = e.player_id
      LEFT JOIN campaigns c ON c.id = e.campaign_id
      LEFT JOIN studio_clients sc ON sc.player_id = p.id
      ORDER BY e.played_at DESC
      LIMIT 20
    `)
    return res.rows ?? []
  } catch { return [] }
}

// ── Helpers ──
function fmtDate(d?: string | null) {
  if (!d) return "Nunca"
  try {
    const diff = Date.now() - new Date(d).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "agora"
    if (mins < 60) return `${mins}min atrás`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h atrás`
    return `${Math.floor(hrs / 24)}d atrás`
  } catch { return "—" }
}

// ── Page ──
export default async function AdminPage() {
  const [stats, screens, alerts, activity] = await Promise.all([
    getStats(), getScreens(), getAlerts(), getRecentActivity()
  ])

  const BRAND = "#0284C7"
  const BRAND_LIGHT = "#F0F9FF"
  const BRAND_DARK = "#0369A1"
  const BRAND_BORDER = "#BAE6FD"

  const onlineScreens = screens.filter(s => s.status === "online")
  const offlineScreens = screens.filter(s => s.status === "offline")
  const slaPercent = stats.total_screens > 0 ? Math.round((stats.online_screens / stats.total_screens) * 100) : 0

  return (
    <main style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui, sans-serif", color: "#111827" }}>

      {/* ── HEADER ── */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 28, height: 28, background: BRAND, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
              <rect x="2" y="2" width="5" height="5" rx="1" fill="white"/>
              <rect x="9" y="2" width="5" height="5" rx="1" fill="white" opacity="0.6"/>
              <rect x="2" y="9" width="5" height="5" rx="1" fill="white" opacity="0.6"/>
              <rect x="9" y="9" width="5" height="5" rx="1" fill="white" opacity="0.3"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 10, color: BRAND, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>DOOHPLAY</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#111827", lineHeight: 1 }}>Dashboard Operacional</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {alerts.length > 0 && (
            <span style={{ background: "#fef2f2", border: "0.5px solid #fecaca", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: "#dc2626" }}>
              ⚠ {alerts.length} alerta{alerts.length > 1 ? "s" : ""}
            </span>
          )}
          <span style={{ background: slaPercent >= 90 ? "#DCFCE7" : slaPercent >= 70 ? "#fef9c3" : "#fef2f2", border: `0.5px solid ${slaPercent >= 90 ? "#bbf7d0" : slaPercent >= 70 ? "#fde047" : "#fecaca"}`, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: slaPercent >= 90 ? "#15803d" : slaPercent >= 70 ? "#854d0e" : "#dc2626" }}>
            SLA {slaPercent}%
          </span>
          <Link href="/advertiser" style={{ background: BRAND_LIGHT, border: `0.5px solid ${BRAND_BORDER}`, borderRadius: 8, padding: "6px 14px", fontSize: 12, color: BRAND_DARK, textDecoration: "none", fontWeight: 500 }}>Portal Anunciante</Link>
        </div>
      </header>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem" }}>

        {/* ── MÉTRICAS PRINCIPAIS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
          {[
            { label: "Telas online", value: `${stats.online_screens}/${stats.total_screens}`, sub: `${stats.offline_screens} offline`, color: stats.offline_screens === 0 ? "#15803d" : "#dc2626", bg: stats.offline_screens === 0 ? "#DCFCE7" : "#fef2f2", border: stats.offline_screens === 0 ? "#bbf7d0" : "#fecaca" },
            { label: "Exibições hoje", value: stats.total_plays_today.toLocaleString("pt-BR"), sub: `${stats.total_plays_week.toLocaleString("pt-BR")} esta semana`, color: BRAND, bg: BRAND_LIGHT, border: BRAND_BORDER },
            { label: "Campanhas ativas", value: stats.active_campaigns, sub: "em veiculação", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
            { label: "Clientes ativos", value: stats.total_clients, sub: "estabelecimentos", color: "#0369A1", bg: BRAND_LIGHT, border: BRAND_BORDER },
          ].map(m => (
            <div key={m.label} style={{ background: m.bg, border: `0.5px solid ${m.border}`, borderRadius: 14, padding: "1.25rem" }}>
              <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{m.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: m.color, letterSpacing: "-0.02em", lineHeight: 1 }}>{m.value}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem" }}>

          {/* ── COLUNA PRINCIPAL ── */}
          <div>

            {/* Alertas */}
            {alerts.length > 0 && (
              <div style={{ background: "#fff", border: "0.5px solid #fecaca", borderRadius: 14, marginBottom: "1.5rem", overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", background: "#fef2f2", borderBottom: "0.5px solid #fecaca", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>⚠️</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#dc2626" }}>Alertas operacionais ({alerts.length})</span>
                </div>
                {alerts.map((a, i) => (
                  <div key={i} style={{ padding: "12px 16px", borderBottom: i < alerts.length - 1 ? "0.5px solid #f9fafb" : "none", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.type === "offline" ? "#dc2626" : "#f59e0b", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{a.screen_name}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{a.message} · {fmtDate(a.since)}</div>
                    </div>
                    <span style={{ fontSize: 10, background: a.type === "offline" ? "#fef2f2" : "#fef9c3", color: a.type === "offline" ? "#dc2626" : "#92400e", border: `0.5px solid ${a.type === "offline" ? "#fecaca" : "#fde047"}`, borderRadius: 20, padding: "2px 8px", fontWeight: 500 }}>
                      {a.type === "offline" ? "OFFLINE" : "SEM PLAYS"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Telas Online */}
            <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 14, marginBottom: "1.5rem", overflow: "hidden" }}>
              <div style={{ padding: "12px 20px", borderBottom: "0.5px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Telas online</div>
                <span style={{ background: "#DCFCE7", border: "0.5px solid #bbf7d0", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600, color: "#15803d", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                  {onlineScreens.length} online
                </span>
              </div>
              {onlineScreens.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Nenhuma tela online agora</div>
              ) : onlineScreens.map((s, i) => (
                <div key={s.id} style={{ padding: "12px 20px", borderBottom: i < onlineScreens.length - 1 ? "0.5px solid #f9fafb" : "none", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#16a34a", flexShrink: 0, boxShadow: "0 0 0 3px #bbf7d0" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{s.location || "Sem localização"} {s.client_name ? `· ${s.client_name}` : ""}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: BRAND }}>{s.plays_today}</div>
                    <div style={{ fontSize: 10, color: "#9ca3af" }}>plays hoje</div>
                  </div>
                  <div style={{ fontSize: 10, color: "#9ca3af", flexShrink: 0 }}>{fmtDate(s.last_ping)}</div>
                  {s.client_code && (
                    <Link href={`/studio/${s.client_code}`} style={{ background: BRAND_LIGHT, border: `0.5px solid ${BRAND_BORDER}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: BRAND_DARK, textDecoration: "none" }}>Studio</Link>
                  )}
                </div>
              ))}
            </div>

            {/* Telas Offline */}
            {offlineScreens.length > 0 && (
              <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 14, marginBottom: "1.5rem", overflow: "hidden" }}>
                <div style={{ padding: "12px 20px", borderBottom: "0.5px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Telas offline</div>
                  <span style={{ background: "#fef2f2", border: "0.5px solid #fecaca", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600, color: "#dc2626" }}>
                    {offlineScreens.length} offline
                  </span>
                </div>
                {offlineScreens.map((s, i) => (
                  <div key={s.id} style={{ padding: "12px 20px", borderBottom: i < offlineScreens.length - 1 ? "0.5px solid #f9fafb" : "none", display: "flex", alignItems: "center", gap: 12, opacity: 0.7 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#9ca3af", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{s.location || "Sem localização"} {s.client_name ? `· ${s.client_name}` : ""}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>Último: {fmtDate(s.last_ping)}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Atividade recente */}
            <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "12px 20px", borderBottom: "0.5px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Atividade recente</div>
                <span style={{ background: BRAND_LIGHT, border: `0.5px solid ${BRAND_BORDER}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 500, color: BRAND_DARK }}>🔐 Verificado</span>
              </div>
              {activity.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Nenhuma atividade registrada</div>
              ) : activity.map((a, i) => (
                <div key={i} style={{ padding: "10px 20px", borderBottom: i < activity.length - 1 ? "0.5px solid #f9fafb" : "none", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: BRAND_LIGHT, border: `0.5px solid ${BRAND_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, color: BRAND }}>▶</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{a.campaign_name || a.client_name || "Exibição"}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{a.player_name} {a.player_location ? `· ${a.player_location}` : ""}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }}>{fmtDate(a.played_at)}</div>
                  {a.duration && <span style={{ background: "#f3f4f6", borderRadius: 20, padding: "1px 8px", fontSize: 10, color: "#6b7280" }}>{a.duration}s</span>}
                </div>
              ))}
            </div>
          </div>

          {/* ── SIDEBAR ── */}
          <div>

            {/* SLA Card */}
            <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 14, padding: "1.25rem", marginBottom: "1rem" }}>
              <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>SLA da Rede</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
                <div style={{ fontSize: 40, fontWeight: 700, color: slaPercent >= 90 ? "#16a34a" : slaPercent >= 70 ? "#d97706" : "#dc2626", letterSpacing: "-0.02em", lineHeight: 1 }}>{slaPercent}%</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>uptime</div>
              </div>
              <div style={{ height: 8, background: "#f3f4f6", borderRadius: 999, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", width: `${slaPercent}%`, background: slaPercent >= 90 ? "#16a34a" : slaPercent >= 70 ? "#d97706" : "#dc2626", borderRadius: 999, transition: "width 0.5s" }} />
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>{stats.online_screens} de {stats.total_screens} telas operacionais</div>
            </div>

            {/* Clientes */}
            <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 14, padding: "1.25rem", marginBottom: "1rem" }}>
              <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Acesso rápido</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "Zimermam", path: "/zimerman", code: "ZIMERM", color: "#C9A84C" },
                  { label: "Meninos da Vila", path: "/meninos-da-vila", code: "LEE001", color: "#EA580C" },
                  { label: "Portal Anunciante", path: "/advertiser", code: null, color: BRAND },
                ].map(c => (
                  <Link key={c.label} href={c.path} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#f9fafb", borderRadius: 8, border: "0.5px solid #e5e7eb", textDecoration: "none" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>{c.label}</div>
                      {c.code && <div style={{ fontSize: 10, color: "#9ca3af" }}>{c.code}</div>}
                    </div>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Plays por tela hoje */}
            <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 14, padding: "1.25rem" }}>
              <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Plays hoje por tela</div>
              {screens.length === 0 ? (
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Sem dados</div>
              ) : screens.slice(0, 8).map(s => {
                const maxPlays = Math.max(...screens.map(x => x.plays_today), 1)
                const pct = Math.round((s.plays_today / maxPlays) * 100)
                return (
                  <div key={s.id} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{s.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: BRAND }}>{s.plays_today}</span>
                    </div>
                    <div style={{ height: 4, background: "#f3f4f6", borderRadius: 999 }}>
                      <div style={{ height: 4, background: s.status === "online" ? BRAND : "#9ca3af", borderRadius: 999, width: `${pct}%`, transition: "width 0.3s" }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
