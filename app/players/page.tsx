export const dynamic = "force-dynamic"

import Link from "next/link"
import { pool } from "@/lib/db"
import TimeAgo from "@/components/ui/TimeAgo"

type Player = {
  id: string
  name: string
  location: string | null
  city: string | null
  state: string | null
  device_type: string | null
  platform: string | null
  resolution_width: number | null
  resolution_height: number | null
  screen_orientation: string | null
  is_active: boolean
  last_ping: string | null
  paired: boolean
  latitude: number | null
  longitude: number | null
  last_heartbeat: string | null
  heartbeat_status: string | null
  plays_today: number | null
}

type Stats = { total: number; active: number; offline: number; paired: number }

function statusColor(p: Player) {
  if (!p.is_active) return "bg-slate-100 border-slate-200 text-slate-500"
  const last = p.last_ping || p.last_heartbeat
  if (!last) return "bg-amber-50 border-amber-200 text-amber-700"
  const mins = (Date.now() - new Date(last).getTime()) / 60000
  if (mins < 5) return "bg-emerald-50 border-emerald-200 text-emerald-700"
  if (mins < 30) return "bg-amber-50 border-amber-200 text-amber-700"
  return "bg-rose-50 border-rose-200 text-rose-700"
}

function statusLabel(p: Player) {
  if (!p.is_active) return "Inativo"
  const last = p.last_ping || p.last_heartbeat
  if (!last) return "Sem sinal"
  const mins = (Date.now() - new Date(last).getTime()) / 60000
  if (mins < 5) return "Online"
  if (mins < 30) return "Idle"
  return "Offline"
}

function statusDot(p: Player) {
  if (!p.is_active) return "bg-slate-400"
  const last = p.last_ping || p.last_heartbeat
  if (!last) return "bg-amber-400"
  const mins = (Date.now() - new Date(last).getTime()) / 60000
  if (mins < 5) return "bg-emerald-500"
  if (mins < 30) return "bg-amber-400"
  return "bg-rose-500"
}

async function getPlayers(): Promise<Player[]> {
  try {
    const r = await Promise.race([
      pool.query(`
        SELECT
          p.id, p.name, p.location, p.device_type, p.platform,
          p.resolution_width, p.resolution_height, p.screen_orientation,
          p.is_active, p.last_ping, p.paired, p.latitude, p.longitude,
          s.city, s.state,
          h.last_seen_at AS last_heartbeat,
          h.status AS heartbeat_status,
          COUNT(e.id)::int AS plays_today
        FROM players p
        LEFT JOIN screens s ON s.player_id = p.id
        LEFT JOIN LATERAL (
          SELECT status, last_seen_at FROM player_heartbeats
          WHERE player_id = p.id ORDER BY created_at DESC LIMIT 1
        ) h ON true
        LEFT JOIN display_events e ON e.player_id = p.id
          AND e.played_at >= CURRENT_DATE
        GROUP BY p.id, s.city, s.state, h.last_seen_at, h.status
        ORDER BY p.is_active DESC, p.last_ping DESC NULLS LAST
        LIMIT 100
      `),
      new Promise((_, j) => setTimeout(() => j(new Error("timeout")), 5000))
    ]) as any
    return r.rows ?? []
  } catch (e) { console.error("Players:", e); return [] }
}

async function getStats(): Promise<Stats> {
  try {
    const r = await Promise.race([
      pool.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE is_active = true)::int AS active,
          COUNT(*) FILTER (WHERE is_active = false)::int AS offline,
          COUNT(*) FILTER (WHERE paired = true)::int AS paired
        FROM players
      `),
      new Promise((_, j) => setTimeout(() => j(new Error("timeout")), 4000))
    ]) as any
    return r.rows?.[0] ?? { total: 0, active: 0, offline: 0, paired: 0 }
  } catch { return { total: 0, active: 0, offline: 0, paired: 0 } }
}

export default async function PlayersPage() {
  const [players, stats] = await Promise.all([getPlayers(), getStats()])
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">📺 Players</h1>
          <p className="mt-2 text-sm text-slate-500">Dispositivos de exibição registrados na rede DOOHPLAY.</p>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total", value: stats.total, cls: "border-slate-200 bg-white text-slate-900" },
            { label: "Ativos", value: stats.active, cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
            { label: "Offline", value: stats.offline, cls: "border-rose-200 bg-rose-50 text-rose-700" },
            { label: "Pareados", value: stats.paired, cls: "border-blue-200 bg-blue-50 text-blue-700" },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border px-5 py-4 shadow-sm ${s.cls}`}>
              <div className="text-xs font-semibold uppercase tracking-wide opacity-60">{s.label}</div>
              <div className="mt-1 text-2xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Dispositivos</h2>
            <span className="text-xs text-slate-400">{players.length} exibidos</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Status", "Nome", "Localização", "Dispositivo", "Resolução", "Plays hoje", "Último ping"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">Nenhum player encontrado.</td></tr>
                ) : players.map(p => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusColor(p)}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDot(p)}`} />
                        {statusLabel(p)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/players/${p.id}`} className="font-medium text-slate-800 hover:text-blue-600 hover:underline">
                        {p.name || "—"}
                      </Link>
                      {p.paired && <span className="ml-2 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs text-blue-600">Pareado</span>}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {[p.city, p.state].filter(Boolean).join(", ") || p.location || "—"}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      <div>{p.device_type || "—"}</div>
                      {p.platform && <div className="text-slate-400">{p.platform}</div>}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-500">
                      {p.resolution_width && p.resolution_height
                        ? `${p.resolution_width}×${p.resolution_height}`
                        : "—"}
                      {p.screen_orientation && <div className="text-slate-400 text-xs">{p.screen_orientation}</div>}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {p.plays_today ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {p.last_ping || p.last_heartbeat
                        ? <TimeAgo date={(p.last_ping || p.last_heartbeat)!} />
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
