import { getPool } from "@/lib/db"
import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  if (secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  const pool = getPool()

  try {
    const [clientsRes, subsRes, advertisersRes, campaignsRes, eventsRes, blocksRes] = await Promise.all([
      pool.query(`
        SELECT sc.id::text, sc.code, sc.name, sc.business_type, sc.active,
               sc.phone, sc.address, sc.created_at,
               p.id::text AS player_id, p.last_seen_at,
               CASE
                 WHEN p.last_seen_at > NOW() - INTERVAL '5 minutes' THEN 'online'
                 WHEN p.last_seen_at IS NOT NULL THEN 'offline'
                 ELSE 'never'
               END AS player_status
        FROM studio_clients sc
        LEFT JOIN players p ON p.id = sc.player_id
        ORDER BY sc.created_at DESC
      `),
      pool.query(`
        SELECT code, asaas_customer_id, asaas_subscription_id, plan, value, status, created_at
        FROM financial_subscriptions
        ORDER BY code
      `),
      pool.query(`
        SELECT id::text, code, name, email, phone, "createdAt"
        FROM "Advertiser"
        ORDER BY "createdAt" DESC
      `),
      pool.query(`
        SELECT c.id::text, c."advertiserCode", c.name, c.status,
               c."startDate", c."endDate", c.budget, c.impressions, c."createdAt",
               COUNT(cs.id)::int AS screen_count,
               COUNT(cm.id)::int AS media_count
        FROM "Campaign" c
        LEFT JOIN "CampaignScreen" cs ON cs."campaignId" = c.id
        LEFT JOIN "CampaignMedia" cm ON cm."campaignId" = c.id
        GROUP BY c.id
        ORDER BY c."createdAt" DESC
        LIMIT 20
      `),
      pool.query(`
        SELECT COUNT(*)::int AS total,
               COUNT(*) FILTER (WHERE played_at > NOW() - INTERVAL '24 hours')::int AS last_24h,
               COUNT(*) FILTER (WHERE played_at > NOW() - INTERVAL '7 days')::int AS last_7d
        FROM display_events
      `),
      pool.query(`
        SELECT COUNT(*)::int AS total,
               COUNT(*) FILTER (WHERE anchored_at IS NOT NULL)::int AS anchored
        FROM event_blocks
      `),
    ])

    return Response.json({
      clients: clientsRes.rows,
      subscriptions: subsRes.rows,
      advertisers: advertisersRes.rows,
      campaigns: campaignsRes.rows,
      events: eventsRes.rows[0],
      blocks: blocksRes.rows[0],
    })
  } catch (err) {
    console.error("[admin stats]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
