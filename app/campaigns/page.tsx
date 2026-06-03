export const dynamic = "force-dynamic"

import Link from "next/link"
import { pool } from "@/lib/db"
import TimeAgo from "@/components/ui/TimeAgo"

type Campaign = {
  id: string
  name: string
  advertiser: string | null
  status: string | null
  is_active: boolean
  start_date: string | null
  end_date: string | null
  duration_seconds: number | null
  cpm: number | null
  media_type: string | null
  plays_total: number | null
  players_count: number | null
  created_at: string
}

type Stats = { total: number; active: number; inactive: number; total_plays: number }

function statusColor(c: Campaign) {
  if (c.status === "active" || c.is_active) return "bg-emerald-50 border-emerald-200 text-emerald-700"
  if (c.status === "paused") return "bg-amber-50 border-amber-200 text-amber-700"
  if (c.status === "ended" || (c.end_date && new Date(c.end_date) < new Date())) return "bg-slate-100 border-slate-200 text-slate-500"
  return "bg-slate-100 border-slate-200 text-slate-500"
}

function statusLabel(c: Campaign) {
  if (c.status) return c.status.charAt(0).toUpperCase() + c.status.slice(1)
  if (c.is_active) return "Ativa"
  return "Inativa"
}

function fmtDate(d?: string | null) {
  if (!d) return "—"
  try { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "UTC" }).format(new Date(d)) } catch { return "—" }
}

function fmtCpm(v?: number | null) {
  if (v == null) return "—"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v))
}

async function getCampaigns(): Promise<Campaign[]> {
  try {
    const r = await Promise.race([
      pool.query(`
        SELECT
          c.id, c.name, c.advertiser, c.status, c.is_active,
          c.start_date, c.end_date, c.duration_seconds, c.cpm, c.media_type,
          c.created_at,
          COUNT(DISTINCT e.id)::int AS plays_total,
          COUNT(DISTINCT e.player_id)::int AS players_count
        FROM campaigns c
        LEFT JOIN display_events e ON e.campaign_id = c.id
        GROUP BY c.id
        ORDER BY c.is_active DESC, c.created_at DESC
        LIMIT 100
      `),
      new Promise((_, j) => setTimeout(() => j(new Error("timeout")), 5000))
    ]) as any
    return r.rows ?? []
  } catch (e) { console.error("Campaigns:", e); return [] }
}

async function getStats(): Promise<Stats> {
  try {
    const r = await Promise.race([
      pool.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE is_active = true)::int AS active,
          COUNT(*) FILTER (WHERE is_active = false)::int AS inactive,
          (SELECT COUNT(*)::int FROM display_events) AS total_plays
        FROM campaigns
      `),
      new Promise((_, j) => setTimeout(() => j(new Error("timeout")), 4000))
    ]) as any
    return r.rows?.[0] ?? { total: 0, active: 0, inactive: 0, total_plays: 0 }
  } catch { return { total: 0, active: 0, inactive: 0, total_plays: 0 } }
}

export default async function CampaignsPage() {
  const [campaigns, stats] = await Promise.all([getCampaigns(), getStats()])
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">📢 Campanhas</h1>
          <p className="mt-2 text-sm text-slate-500">Campanhas DOOH registradas com verificação criptográfica de exibição.</p>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total", value: stats.total, cls: "border-slate-200 bg-white text-slate-900" },
            { label: "Ativas", value: stats.active, cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
            { label: "Inativas", value: stats.inactive, cls: "border-slate-200 bg-white text-slate-500" },
            { label: "Total de Plays", value: stats.total_plays?.toLocaleString("pt-BR"), cls: "border-blue-200 bg-blue-50 text-blue-700" },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border px-5 py-4 shadow-sm ${s.cls}`}>
              <div className="text-xs font-semibold uppercase tracking-wide opacity-60">{s.label}</div>
              <div className="mt-1 text-2xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Campanhas</h2>
            <span className="text-xs text-slate-400">{campaigns.length} exibidas</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Status", "Nome", "Anunciante", "Período", "CPM", "Plays", "Players", "Tipo", "Criada em"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400">Nenhuma campanha encontrada.</td></tr>
                ) : campaigns.map(c => (
                  <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusColor(c)}`}>
                        {statusLabel(c)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/campaigns/${c.id}`} className="font-medium text-slate-800 hover:text-blue-600 hover:underline">
                        {c.name || "—"}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{c.advertiser || "—"}</td>
                    <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {fmtDate(c.start_date)} → {fmtDate(c.end_date)}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{fmtCpm(c.cpm)}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {(c.plays_total ?? 0).toLocaleString("pt-BR")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {c.players_count ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">{c.media_type || "—"}</td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {c.created_at ? <TimeAgo date={c.created_at} /> : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { href: "/players", icon: "📺", title: "Players", desc: "Ver dispositivos ativos" },
            { href: "/explorer", icon: "🔍", title: "Explorer", desc: "Blocos e provas on-chain" },
            { href: "/verify", icon: "🔐", title: "Verificar", desc: "Verificar uma prova" },
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
