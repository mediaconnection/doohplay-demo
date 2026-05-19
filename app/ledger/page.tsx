import Link from "next/link"
import { pool } from "@/lib/db"

type EventRow = {
  event_id: string
  event_type: string
  occurred_at: Date | string
}

async function getEvents(): Promise<EventRow[]> {
  try {
    const res = await pool.query(`
      SELECT
        event_id,
        event_type,
        occurred_at
      FROM event_chain
      ORDER BY occurred_at DESC
      LIMIT 50
    `)

    return res.rows as EventRow[]
  } catch (error) {
    console.error("Ledger query error:", error)
    return []
  }
}

function formatTimestamp(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "medium"
  }).format(date)
}

export default async function LedgerPage() {
  const events = await getEvents()

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>DOOHPLAY Ledger Explorer</h1>

      <p>
        This page lists recent events recorded in the DOOHPLAY cryptographic ledger.
      </p>

      <table
        style={{
          width: "100%",
          marginTop: 30,
          borderCollapse: "collapse"
        }}
      >
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
              Event ID
            </th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
              Type
            </th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
              Timestamp
            </th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
              Verify
            </th>
          </tr>
        </thead>

        <tbody>
          {events.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: 10 }}>
                No events found.
              </td>
            </tr>
          )}

          {events.map((event) => {
            const formattedTime = formatTimestamp(event.occurred_at)

            return (
              <tr key={event.event_id}>
                <td style={{ padding: 8 }}>
                  <Link href={`/ledger/event/${event.event_id}`}>
                    <code>{event.event_id}</code>
                  </Link>
                </td>

                <td style={{ padding: 8 }}>{event.event_type}</td>

                <td style={{ padding: 8 }}>{formattedTime}</td>

                <td style={{ padding: 8 }}>
                  <Link href={`/verify/${event.event_id}`}>verify</Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}