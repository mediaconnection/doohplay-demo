export const dynamic = "force-dynamic"

import Link from "next/link"
import { pool } from "@/lib/db"

type Screen = {
  id: string
  name: string
  city: string | null
  state: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  status: string | null
  location_type: string | null
  venue_name: string | null
  screen_group: string | null
  player_version: string | null
  last_seen_at: string | null
  plays_today: number | null
}

type Stats = { total: number; online: number; offline: number; cities: number }

function statusColor(s: Screen) {
  if (!s.status || s.status === "offline") return "bg-rose-50 border-rose-200 text-rose-700"
  if (s.status === "online") return "bg-emerald-50 border-emerald-200 text-emerald-700"
  return "bg-amber-50 border-amber-200 text-amber-700"
}

function fmtDate(d?: string | null) {
  if (!d) return "—"
  try { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" }).format(new Date(d)) } catch { return "—" }
}

async function getScreens(): Promise<Screen[]> {
  try {
    const r = await Promise.race([
      pool.query(`
        SELECT
          s.id, s.name, s.city, s.state, s.country,
          s.latitude, s.longitude, s.status,
          s.location_type, s.venue_name, s.screen_group,
          s.player_version, s.last_seen_at,
          COUNT(e.id)::int AS plays_today
        FROM screens s
        LEFT JOIN display_events e ON e.screen_id = s.id
          AND e.played_at >= CURRENT_DATE
        GROUP BY s.id
        ORDER BY s.status ASC NULLS LAST, s.last_seen_at DESC NULLS LAST
        LIMIT 200
      `),
      new Promise((_, j) => setTimeout(() => j(new Error("timeout")), 5000))
    ]) as any
    return r.rows ?? []
  } catch (e) { console.error("Network map:", e); return [] }
}

async function getStats(): Promise<Stats> {
  try {
    const r = await Promise.race([
      pool.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE status = 'online')::int AS online,
          COUNT(*) FILTER (WHERE status != 'online' OR status IS NULL)::int AS offline,
          COUNT(DISTINCT city)::int AS cities
        FROM screens
      `),
      new Promise((_, j) => setTimeout(() => j(new Error("timeout")), 4000))
    ]) as any
    return r.rows?.[0] ?? { total: 0, online: 0, offline: 0, cities: 0 }
  } catch { return { total: 0, online: 0, offline: 0, cities: 0 } }
}

export default async function NetworkMapPage() {
  const [screens, stats] = await Promise.all([getScreens(), getStats()])

  // Agrupar por cidade
  const byCity = screens.reduce<Record<string, Screen[]>>((acc, s) => {
    const key = [s.city, s.state].filter(Boolean).join(", ") || "Sem localização"
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">🗺️ Network Map</h1>
          <p className="mt-2 text-sm text-slate-500">Telas DOOH distribuídas na rede, agrupadas por localização.</p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total de Telas", value: stats.total, cls: "border-slate-200 bg-white text-slate-900" },
            { label: "Online", value: stats.online, cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
            { label: "Offline", value: stats.offline, cls: "border-rose-200 bg-rose-50 text-rose-700" },
            { label: "Cidades", value: stats.cities, cls: "border-blue-200 bg-blue-50 text-blue-700" },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border px-5 py-4 shadow-sm ${s.cls}`}>
              <div className="text-xs font-semibold uppercase tracking-wide opacity-60">{s.label}</div>
              <div className="mt-1 text-2xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Telas agrupadas por cidade */}
        {Object.keys(byCity).length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 shadow-sm">
            Nenhuma tela encontrada.
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(byCity).map(([city, cityScreens]) => {
              const onlineCount = cityScreens.filter(s => s.status === "online").length
              return (
                <div key={city} className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📍</span>
                      <div>
                        <h2 className="text-sm font-semibold text-slate-800">{city}</h2>
                        <p className="text-xs text-slate-400">{cityScreens.length} tela{cityScreens.length !== 1 ? "s" : ""} · {onlineCount} online</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {onlineCount > 0 && (
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {onlineCount} online
                        </span>
                      )}
                      {cityScreens.length - onlineCount > 0 && (
                        <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700">
                          {cityScreens.length - onlineCount} offline
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {cityScreens.map(s => (
                      <div key={s.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusColor(s)}`}>
                          {s.status || "offline"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-800 truncate">{s.name || "—"}</div>
                          <div className="text-xs text-slate-400 truncate">
                            {[s.venue_name, s.location_type, s.screen_group].filter(Boolean).join(" · ") || "Sem detalhes"}
                          </div>
                        </div>
                        <div className="text-right text-xs text-slate-400 hidden sm:block">
                          <div>v{s.player_version || "—"}</div>
                          <div>{fmtDate(s.last_seen_at)}</div>
                        </div>
                        <div className="text-right">
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            {s.plays_today ?? 0} plays
                          </span>
                        </div>
                        {s.latitude && s.longitude && (
                          <a
                            href={`https://maps.google.com/?q=${s.latitude},${s.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                            title="Ver no mapa"
                          >
                            🗺️
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { href: "/players", icon: "📺", title: "Players", desc: "Dispositivos de exibição" },
            { href: "/campaigns", icon: "📢", title: "Campanhas", desc: "Campanhas ativas" },
            { href: "/explorer", icon: "🔍", title: "Explorer", desc: "Blocos on-chain" },
          ].map(l => (
            <Link key={l.href} href={l.href} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm hover:bg-slate-50 transition-colors">
              <div className="text-sm font-semibold text-slate-700">{l.icon} {l.title}</div>
              <div className="mt-1 text-xs text-slate-400">{l.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
