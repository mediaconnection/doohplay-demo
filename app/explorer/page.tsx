export const dynamic = "force-dynamic"

import Link from "next/link"
import { pool } from "@/lib/db"
import SearchBar from "@/components/explorer/SearchBar"
import CopyButton from "@/components/ui/CopyButton"
import TimeAgo from "@/components/ui/TimeAgo"

type Block = {
  id: number
  merkle_root: string | null
  block_hash: string | null
  tx_hash: string | null
  blockchain_tx: string | null
  anchored_at: string | null
  confirmations: number | null
  created_at: string
  event_count: number | null
}
type Stats = { total: number; anchored: number; pending: number; latest_at: string | null }

function shortHash(h?: string | null, size = 14) {
  if (!h) return "—"
  return h.length <= size + 2 ? h : `${h.slice(0, size)}…`
}
function isAnchored(b: Block) { return !!(b.tx_hash || b.blockchain_tx) && !!b.anchored_at }
function getTx(b: Block) { return b.tx_hash || b.blockchain_tx || null }
function fmt(d?: string | null) {
  if (!d) return "—"
  try { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" }).format(new Date(d)) } catch { return "—" }
}

async function getBlocks(): Promise<Block[]> {
  try {
    const r = await Promise.race([
      pool.query(`
        SELECT b.id, b.merkle_root, b.block_hash, b.tx_hash, b.blockchain_tx,
               b.anchored_at, b.confirmations, b.created_at,
               0::int AS event_count
        FROM event_blocks b
        ORDER BY b.created_at DESC LIMIT 50
      `),
      new Promise((_, j) => setTimeout(() => j(new Error("timeout")), 4000))
    ]) as any
    return r.rows ?? []
  } catch { return [] }
}

async function getStats(): Promise<Stats> {
  try {
    const r = await Promise.race([
      pool.query(`SELECT COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE anchored_at IS NOT NULL)::int AS anchored,
        COUNT(*) FILTER (WHERE anchored_at IS NULL)::int AS pending,
        MAX(created_at)::text AS latest_at FROM event_blocks`),
      new Promise((_, j) => setTimeout(() => j(new Error("timeout")), 4000))
    ]) as any
    return r.rows?.[0] ?? { total: 0, anchored: 0, pending: 0, latest_at: null }
  } catch { return { total: 0, anchored: 0, pending: 0, latest_at: null } }
}

export default async function ExplorerPage() {
  const [blocks, stats] = await Promise.all([getBlocks(), getStats()])
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">🔍 DOOHPLAY Explorer</h1>
          <p className="mt-2 text-sm text-slate-500">Ledger público de blocos e provas criptográficas ancoridas na Polygon.</p>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total de Blocos", value: stats.total, cls: "border-slate-200 bg-white text-slate-900" },
            { label: "Anchorados", value: stats.anchored, cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
            { label: "Pendentes", value: stats.pending, cls: "border-amber-200 bg-amber-50 text-amber-700" },
            { label: "Último Bloco", value: fmt(stats.latest_at), cls: "border-slate-200 bg-white text-slate-700", small: true },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border px-5 py-4 shadow-sm ${s.cls}`}>
              <div className="text-xs font-semibold uppercase tracking-wide opacity-60">{s.label}</div>
              <div className={`mt-1 font-bold ${s.small ? "text-sm" : "text-2xl"}`}>{s.value}</div>
            </div>
          ))}
        </div>
        <div className="mb-6"><SearchBar /></div>
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Blocos recentes</h2>
            <span className="text-xs text-slate-400">{stats.total} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["#", "Merkle Root", "TX Hash (Polygon)", "Eventos", "Confirms", "Status", "Criado em"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blocks.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">Nenhum bloco encontrado.</td></tr>
                ) : blocks.map(b => {
                  const anchored = isAnchored(b)
                  const tx = getTx(b)
                  return (
                    <tr key={b.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">
                        {b.block_hash
                          ? <Link href={`/explorer/block/${b.block_hash}`} className="text-blue-600 hover:underline">#{b.id}</Link>
                          : <span>#{b.id}</span>}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs">
                        {b.merkle_root ? <div className="flex items-center gap-1"><span className="text-slate-600">{shortHash(b.merkle_root)}</span><CopyButton value={b.merkle_root} /></div> : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs">
                        {tx ? (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-600">{shortHash(tx)}</span>
                            <CopyButton value={tx} />
                            <a href={`https://polygonscan.com/tx/${tx}`} target="_blank" rel="noreferrer" className="text-purple-500 hover:text-purple-700" title="Ver na Polygon">⬡</a>
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">{b.event_count ?? "—"}</span>
                      </td>
                      <td className="px-5 py-4 text-center text-xs text-slate-500">{typeof b.confirmations === "number" ? b.confirmations.toLocaleString("pt-BR") : "—"}</td>
                      <td className="px-5 py-4">
                        {anchored
                          ? <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">✓ Anchored</span>
                          : <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">⏳ Pending</span>}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">{b.created_at ? <TimeAgo date={b.created_at} /> : "—"}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {blocks.length > 0 && <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-400">Exibindo {blocks.length} blocos mais recentes · Auto-refresh 10s</div>}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { href: "/verify", icon: "🔐", title: "Verificar hash", desc: "Consultar uma prova criptográfica" },
            { href: "/players", icon: "📺", title: "Players", desc: "Ver telas e dispositivos ativos" },
            { href: "/campaigns", icon: "📢", title: "Campanhas", desc: "Campanhas ativas e histórico" },
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
