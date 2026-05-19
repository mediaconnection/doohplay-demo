import { pool } from "@/lib/db"

export const dynamic = "force-dynamic"

type LedgerAnchorRow = {
  block_height: number | string | null
  block_hash: string | null
  network: string | null
  tx_hash: string | null
  anchored_at: string | Date | null
}

function shortHash(value: string | null, size = 16): string {
  if (!value) return "—"
  return value.length > size ? `${value.slice(0, size)}...` : value
}

function formatDate(value: string | Date | null): string {
  if (!value) return "—"

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("pt-BR")
}

export default async function LedgerAnchorsPage() {
  const res = await pool.query(`
    SELECT
      block_height,
      block_hash,
      network,
      tx_hash,
      anchored_at
    FROM public.ledger_anchors
    ORDER BY anchored_at DESC NULLS LAST
  `)

  const anchors = res.rows as LedgerAnchorRow[]

  return (
    <div style={{ padding: 40 }}>
      <h1>Ledger Anchors</h1>

      <table style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th align="left">Block</th>
            <th align="left">Hash</th>
            <th align="left">Network</th>
            <th align="left">Tx</th>
            <th align="left">Date</th>
          </tr>
        </thead>

        <tbody>
          {anchors.map((anchor) => (
            <tr key={anchor.tx_hash ?? `${anchor.block_height}-${anchor.block_hash}`}>
              <td>#{anchor.block_height ?? "—"}</td>

              <td>
                <code>{shortHash(anchor.block_hash)}</code>
              </td>

              <td>{anchor.network ?? "—"}</td>

              <td>
                <code>{anchor.tx_hash ?? "—"}</code>
              </td>

              <td>{formatDate(anchor.anchored_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}