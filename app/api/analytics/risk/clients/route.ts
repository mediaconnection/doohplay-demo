export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0


/* =========================
   TYPES
========================= */

type DbRow = {
  id: number
  name: string
  total_events: number
  last_event: string | null
  avg_trust: number | null
}

/* =========================
   GET
========================= */

export async function GET() {
    const { pool } = await import("@/lib/db")

    const { generateAlerts, summarizeAlerts } = await import("@proof-engine/domain/fraud/alerts")

  try {
    const res = await pool.query(`
      SELECT 
        c.id,
        c.name,

        COUNT(e.event_id)::int as total_events,
        MAX(e.created_at) as last_event,

        AVG(e.trust_score)::float as avg_trust

      FROM clients c
      LEFT JOIN event_chain e ON e.client_id = c.id
      GROUP BY c.id, c.name
      ORDER BY avg_trust ASC NULLS LAST
    `)

    const clients = (res.rows as DbRow[]).map(c => {
      const hasData = c.avg_trust !== null

      const score =
        hasData && typeof c.avg_trust === "number"
          ? Math.round(c.avg_trust)
          : null

      /* =========================
         RISK CLASSIFICATION
      ========================= */

      let risk: "LOW" | "MEDIUM" | "HIGH" | "NO_DATA" = "NO_DATA"

      if (score !== null) {
        if (score < 50) risk = "HIGH"
        else if (score < 80) risk = "MEDIUM"
        else risk = "LOW"
      }

      /* =========================
         ALERTS 🔥
      ========================= */

      let alerts: any[] = []
      let summary = { level: "LOW", count: 0 }

      if (score !== null) {
        alerts = generateAlerts({
          id: c.id,
          name: c.name,
          trust_score: score,
          total_events: c.total_events,
          last_event: c.last_event,
        })

        summary = summarizeAlerts(alerts)
      }

      return {
        id: c.id,
        name: c.name,

        total_events: c.total_events,
        last_event: c.last_event,

        trust_score: score,
        risk,

        alerts,
        alert_summary: summary,
      }
    })

    return Response.json({ clients })

  } catch (err) {
    console.error("Risk API error:", err)

    return Response.json(
      { error: "Failed to load risk data" },
      { status: 500 }
    )
  }
}

