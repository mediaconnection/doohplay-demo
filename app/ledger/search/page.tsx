export const dynamic = "force-dynamic"
export const revalidate = 0

import Link from "next/link"
import { pool } from "@/lib/db"

interface Props {
  searchParams: Promise<{ q?: string }>
}

type EventRow = {
  event_id: string
  event_hash: string
  event_type: string
  occurred_at: string | Date
}

type BlockRow = {
  block_height: number
  block_hash: string
  created_at: string | Date
}

function shortHash(hash?: string | null) {
  if (!hash) return "-"
  return `${hash.slice(0, 16)}...`
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await Promise.resolve(searchParams)
  const q = params.q?.trim() ?? ""

  if (!q) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Ledger Search</h1>
        <p>Enter a hash, event id or block height.</p>
      </div>
    )
  }

  let events: EventRow[] = []
  let blocks: BlockRow[] = []

  try {
    const eventRes = await pool.query(
      `
      SELECT
        event_id,
        event_hash,
        event_type,
        occurred_at
      FROM event_chain
      WHERE event_id = $1
         OR event_hash = $1
      LIMIT 20
      `,
      [q]
    )

    events = eventRes.rows as EventRow[]

    const blockRes = await pool.query(
      `
      SELECT
        block_height,
        block_hash,
        created_at
      FROM ledger_blocks
      WHERE block_hash = $1
         OR block_height::text = $1
      LIMIT 10
      `,
      [q]
    )

    blocks = blockRes.rows as BlockRow[]
  } catch (err) {
    console.error("Ledger search error", err)
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Ledger Search</h1>

      <p>
        Query: <code>{q}</code>
      </p>

      <h2 style={{ marginTop: 30 }}>Blocks</h2>

      {blocks.length === 0 && <p>No blocks found.</p>}

      {blocks.map((block) => {
        const date =
          typeof block.created_at === "string"
            ? new Date(block.created_at)
            : block.created_at

        return (
          <div
            key={block.block_height}
            style={{
              border: "1px solid #ddd",
              padding: 15,
              marginTop: 10
            }}
          >
            <div>
              <b>Block #{block.block_height}</b>
            </div>

            <div>
              <code>{shortHash(block.block_hash)}</code>
            </div>

            <div>{date.toLocaleString()}</div>

            <div style={{ marginTop: 10 }}>
              <Link href={`/ledger/block/${block.block_height}`}>
                Open block
              </Link>
            </div>
          </div>
        )
      })}

      <h2 style={{ marginTop: 40 }}>Events</h2>

      {events.length === 0 && <p>No events found.</p>}

      {events.map((event) => {
        const date =
          typeof event.occurred_at === "string"
            ? new Date(event.occurred_at)
            : event.occurred_at

        return (
          <div
            key={event.event_id}
            style={{
              border: "1px solid #eee",
              padding: 15,
              marginTop: 10
            }}
          >
            <div>
              <b>{event.event_type}</b>
            </div>

            <div>
              <code>{shortHash(event.event_hash)}</code>
            </div>

            <div>{date.toLocaleString()}</div>

            <div style={{ marginTop: 10 }}>
              <Link href={`/ledger/event/${event.event_id}`}>
                Open event
              </Link>
            </div>
          </div>
        )
      })}

      <div style={{ marginTop: 40 }}>
        <Link href="/ledger">Back to ledger</Link>
      </div>
    </div>
  )
}