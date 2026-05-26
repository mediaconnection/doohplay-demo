export const dynamic = "force-dynamic"

import Link from "next/link"
import { pool } from "@/lib/db"
import SearchBar from "@/components/explorer/SearchBar"
import CopyButton from "@/components/ui/CopyButton"
import TimeAgo from "@/components/ui/TimeAgo"
import Badge from "@/components/ui/Badge"

export const revalidate = 10 // 🔥 auto-refresh

/* =========================
   TYPES
========================= */

type Block = {
  id: number
  merkle_root: string | null
  block_hash: string | null
  created_at: string
}

/* =========================
   UTILS
========================= */

function shortHash(hash?: string | null, size = 12) {
  if (!hash) return "-"
  if (hash.length <= size) return hash
  return `${hash.slice(0, size)}...`
}

function isValidHash(hash?: string | null) {
  return !!hash && /^0x[a-f0-9]{64}$/i.test(hash)
}

/* =========================
   FETCH (SAFE)
========================= */

async function getBlocks(): Promise<Block[]> {
  try {
    const res = await Promise.race([
      pool.query(`
        SELECT 
          id,
          merkle_root,
          block_hash,
          created_at
        FROM event_blocks
        ORDER BY created_at DESC
        LIMIT 20
      `),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB_TIMEOUT")), 3000)
      )
    ]) as any

    return res.rows || []

  } catch (err) {
    console.error("❌ Failed to load blocks:", err)
    return []
  }
}

/* =========================
   PAGE
========================= */

export default async function ExplorerPage() {
  const blocks = await getBlocks()

  return (
    <div className="p-10 max-w-6xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        DOOHPLAY Explorer
      </h1>

      <SearchBar />

      <div className="border rounded overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Block</th>
              <th className="p-3 text-left">Merkle Root</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Time</th>
            </tr>
          </thead>

          <tbody>

            {blocks.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No blocks found
                </td>
              </tr>
            ) : (
              blocks.map((b) => {

                const blockHash = b.block_hash
                const merkleRoot = b.merkle_root

                const isAnchored = isValidHash(blockHash)
                const status = isAnchored ? "Anchored" : "Pending"

                return (
                  <tr key={b.id} className="border-t hover:bg-gray-50">

                    {/* BLOCK */}

                    <td className="p-3 font-mono">

                      {isAnchored ? (
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/explorer/block/${blockHash}`}
                            className="text-blue-600 underline"
                          >
                            {shortHash(blockHash)}
                          </Link>

                          <CopyButton value={blockHash} />
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}

                    </td>

                    {/* MERKLE */}

                    <td className="p-3 font-mono text-xs">

                      {merkleRoot ? (
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/explorer/merkle/${merkleRoot}`}
                            className="text-blue-600 underline"
                          >
                            {shortHash(merkleRoot, 16)}
                          </Link>

                          <CopyButton value={merkleRoot} />
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}

                    </td>

                    {/* STATUS */}

                    <td className="p-3">
                      <Badge
                        label={status}
                        variant={isAnchored ? "success" : "warning"}
                      />
                    </td>

                    {/* TIME */}

                    <td className="p-3 text-gray-600">
                      {b.created_at
                        ? <TimeAgo date={b.created_at} />
                        : "-"
                      }
                    </td>

                  </tr>
                )
              })
            )}

          </tbody>

        </table>

      </div>

    </div>
  )
}