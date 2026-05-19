export const dynamic = "force-dynamic"
export const revalidate = 0

import Link from "next/link"
import { pool } from "@/lib/db"

interface Props {
  params: Promise<{
    height: string
  }>
}

type Block = {
  block_height: number
  block_hash: string
  previous_hash: string | null
  merkle_root: string
  event_count: number
  created_at: string | Date | null
}

type EventRow = {
  event_id: string
  event_hash: string
  event_type: string
  occurred_at: string | Date
}

function shortHash(hash?: string | null) {
  if (!hash) return "-"
  if (hash.length <= 16) return hash

  return `${hash.slice(0, 16)}...`
}

export default async function BlockPage({ params }: Props) {
  const { height: heightStr } = await params
  const height = Number(heightStr)

  if (Number.isNaN(height)) {
    return <div style={{ padding: 40 }}>Invalid block height</div>
  }

  let block: Block | null = null
  let events: EventRow[] = []

  try {
    const blockRes = await pool.query(
      `
      SELECT
        block_height,
        block_hash,
        previous_hash,
        merkle_root,
        event_count,
        created_at
      FROM ledger_blocks
      WHERE block_height = $1
      LIMIT 1
      `,
      [height]
    )

    const blockRows = blockRes.rows as Block[]
    block = blockRows[0] ?? null

    if (block) {
      const eventsRes = await pool.query(
        `
        SELECT
          event_id,
          event_hash,
          event_type,
          occurred_at
        FROM event_chain
        WHERE block_height = $1
        ORDER BY occurred_at ASC
        `,
        [height]
      )

      events = eventsRes.rows as EventRow[]
    }
  } catch (error) {
    console.error("BlockPage query error", {
      height,
      error
    })

    return <div style={{ padding: 40 }}>Database error while loading block.</div>
  }

  if (!block) {
    return <div style={{ padding: 40 }}>Block not found</div>
  }

  const timestamp = block.created_at
    ? new Date(block.created_at).toLocaleString()
    : "-"

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Ledger Block #{block.block_height}</h1>

      <div style={{ marginTop: 20 }}>
        <p>
          <b>Block Hash</b>
        </p>
        <code>{block.block_hash}</code>

        <p>
          <b>Previous Hash</b>
        </p>
        <code>{block.previous_hash ?? "-"}</code>

        <p>
          <b>Merkle Root</b>
        </p>
        <code>{block.merkle_root}</code>

        <p>
          <b>Events</b>
        </p>
        <p>{block.event_count}</p>

        <p>
          <b>Timestamp</b>
        </p>
        <p>{timestamp}</p>
      </div>

      <h2 style={{ marginTop: 40 }}>Block Events</h2>

      <table
        style={{
          width: "100%",
          marginTop: 20,
          borderCollapse: "collapse"
        }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid #ddd" }}>
            <th align="left">Event ID</th>
            <th align="left">Type</th>
            <th align="left">Hash</th>
            <th align="left">Timestamp</th>
          </tr>
        </thead>

        <tbody>
          {events.length === 0 && (
            <tr>
              <td colSpan={4}>No events in this block.</td>
            </tr>
          )}

          {events.map((event) => {
            const date =
              typeof event.occurred_at === "string"
                ? new Date(event.occurred_at)
                : event.occurred_at

            return (
              <tr
                key={event.event_id}
                style={{ borderBottom: "1px solid #eee" }}
              >
                <td>
                  <Link href={`/ledger/event/${event.event_id}`}>
                    {event.event_id}
                  </Link>
                </td>

                <td>{event.event_type}</td>

                <td>
                  <code>{shortHash(event.event_hash)}</code>
                </td>

                <td>{date.toLocaleString()}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div style={{ marginTop: 40 }}>
        <Link href="/ledger/blocks">Back to blocks</Link>
      </div>
    </div>
  )
}