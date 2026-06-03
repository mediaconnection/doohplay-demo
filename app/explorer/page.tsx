export const dynamic = "force-dynamic"

import Link from "next/link"
import { pool } from "@/lib/db"
import SearchBar from "@/components/explorer/SearchBar"
import CopyButton from "@/components/ui/CopyButton"
import TimeAgo from "@/components/ui/TimeAgo"

/* =========================
   TYPES
========================= */
type Block = {
  id: number
  merkle_root: string | null
  block_hash: string | null
  prev_block_hash: string | null
  event_count: number | null
  created_at: string
}

type Stats = {
  total: number
  anchored: number
  pending: number
  latest_at: string | null
}

/* =========================
   UTILS
========================= */
function shortHash(hash?: string | null, size = 14) {
  if (!hash) return "—"
  const clean = hash.startsWith("0x") ? hash : `0x${hash}`
  if (clean.length <= size + 2) return clean
  return `${clean.slice(0, size)}…`
}

function isAnchored(hash?: string | null) {
  return !!hash && /^(0x)?[a-f0-9]{64}$/i.test(hash)
}

function formatDate(date?: string | null) {
  if (!date) return "—"
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "medium",
      timeZone: "UTC"
    }).format(new Date(date))
  } catch { return "—" }
}

/* =========================
   FETCH
========================= */
async function getBlocks(): Promise<Block[]> {
  try {
    const res = await Promise.race([
      pool.query(`
        SELECT
          id,
          merkle_root,
          block_hash,
          prev_block_hash,
          event_count,
          created_at
        FROM event_blocks
        ORDER BY created_at DESC
        LIMIT 50
      `),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB_TIMEOUT")), 4000)
      )
    ]) as any
    return res.rows ?? []
  } catch (err) {
    console.error("Explorer: failed to load blocks:", err)
    return []
  }
}

async function getStats(): Promise<Stats> {
  try {
    const res = await Promise.race([
      pool.query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE block_hash IS NOT NULL AND block_hash ~ '^(0x)?[a-f0-9]{64}$')::int AS anchored,
          COUNT(*) FILTER (WHERE block_hash IS NULL OR block_hash !~ '^(0x)?[a-f0-9]{64}$')::int AS pending,
          MAX(created_at)::text AS latest_at
        FROM event_blocks
      `),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB_TIMEOUT")), 4000)
      )
    ]) as any
    return res.rows?.[0] ?? { total: 0, anchored: 0, pending: 0, latest_at: null }
  } catch {
    return { total: 0, anchored: 0, pending: 0, latest_at: null }
  }
}

/* =========================
   PAGE
========================= */
export default async function ExplorerPage() {
  const [blocks, stats] = await Promise.all([getBlocks(), getStats()])

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            🔍 DOOHPLAY Explorer
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Ledger público de blocos, eventos e provas criptográficas ancoridas na Polygon.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total de Blocos</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</div>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Anchorados</div>
            <div className="mt-1 text-2xl font-bold text-emerald-700">{stats.anchored}</div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-600">Pendentes</div>
            <div className="mt-1 text-2xl font-bold text-amber-700">{stats.pending}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Último Bloco</div>
            <div className="mt-1 text-sm font-semibold text-slate-700">{formatDate(stats.latest_at)}</div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar />
        </div>

        {/* Blocks table */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-700">Blocos recentes</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">#</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Block Hash</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Merkle Root</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Eventos</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {blocks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      Nenhum bloco encontrado.
                    </td>
                  </tr>
                ) : (
                  blocks.map((b) => {
                    const anchored = isAnchored(b.block_hash)
                    const hash = b.block_hash
                    const merkle = b.merkle_root
                    const polygonUrl = hash
                      ? `https://polygonscan.com/search?q=${hash}`
                      : null

                    return (
                      <tr key={b.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        {/* ID */}
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                          {b.id}
                        </td>

                        {/* Block Hash */}
                        <td className="px-6 py-4 font-mono text-xs">
                          {anchored && hash ? (
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/explorer/block/${hash}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {shortHash(hash)}
                              </Link>
                              <CopyButton value={hash} />
                              {polygonUrl && (
                                <a
                                  href={polygonUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-purple-500 hover:text-purple-700 text-xs"
                                  title="Ver na Polygon"
                                >
                                  ⬡
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>

                        {/* Merkle Root */}
                        <td className="px-6 py-4 font-mono text-xs">
                          {merkle ? (
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/explorer/event/${merkle}`}
                                className="text-slate-600 hover:text-slate-900 hover:underline"
                              >
                                {shortHash(merkle)}
                              </Link>
                              <CopyButton value={merkle} />
                            </div>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>

                        {/* Event Count */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                            {b.event_count ?? "—"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {anchored ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                              ✓ Anchored
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
                              ⏳ Pending
                            </span>
                          )}
                        </td>

                        {/* Time */}
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {b.created_at ? <TimeAgo date={b.created_at} /> : "—"}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {blocks.length > 0 && (
            <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-400">
              Exibindo os {blocks.length} blocos mais recentes · Atualização automática a cada 10s
            </div>
          )}
        </div>

        {/* Links rápidos */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/verify"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <div className="text-sm font-semibold text-slate-700">🔐 Verificar hash</div>
            <div className="mt-1 text-xs text-slate-400">Consultar uma prova criptográfica</div>
          </Link>
          <Link
            href="/audit/explorer"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <div className="text-sm font-semibold text-slate-700">📋 Audit Explorer</div>
            <div className="mt-1 text-xs text-slate-400">Auditoria detalhada de eventos</div>
          </Link>
          <Link
            href="/ledger"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <div className="text-sm font-semibold text-slate-700">🗄️ Ledger</div>
            <div className="mt-1 text-xs text-slate-400">Visualizar cadeia de blocos</div>
          </Link>
        </div>

      </div>
    </main>
  )
}
