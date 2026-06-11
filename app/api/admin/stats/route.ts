// app/api/admin/stats/route.ts
import { getPool } from "@/lib/db"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  // Aceita tanto sessão NextAuth quanto secret legacy (retrocompatibilidade)
  const session = await getServerSession()
  const secret  = req.nextUrl.searchParams.get("secret")

  const isNextAuth = !!session?.user
  const isLegacy   = secret && secret === process.env.ADMIN_SECRET

  if (!isNextAuth && !isLegacy) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  const pool = getPool()
  try {
    const [clientsRes, subsRes, advertisersRes, campaignsRes, eventsRes, blocksRes, mediasRes] = await Promise.all([
      pool.query(`
        SELECT sc.id::text, sc.code, sc.name, sc.business_type, sc.active,
               sc.phone, sc.address, sc.created_at,
               p.id::text AS player_id, p.last_ping,
               CASE
                 WHEN p.last_ping > NOW() - INTERVAL '5 minutes' THEN 'online'
                 WHEN p.last_ping IS NOT NULL THEN 'offline'
                 ELSE 'never'
               END AS player_status
        FROM studio_clients sc
        LEFT JOIN players p ON p.id = sc.player_id
        ORDER BY sc.created_at DESC
      `),
      pool.query(`
        SELECT code, asaas_customer_id, asaas_subscription_id, plan, value, status, created_at
        FROM financial_subscriptions ORDER BY code
      `),
      pool.query(`
        SELECT id::text, code, name, email, phone, "createdAt"
        FROM "Advertiser" ORDER BY "createdAt" DESC
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
      pool.query(`
        SELECT m.id::text, m.name, m.type, m.status, m.url, m."createdAt",
               c.name AS campaign_name, c."advertiserCode",
               a.name AS advertiser_name, a.phone AS advertiser_phone
        FROM "CampaignMedia" m
        JOIN "Campaign" c ON c.id = m."campaignId"
        JOIN "Advertiser" a ON a.code = c."advertiserCode"
        ORDER BY m."createdAt" DESC
        LIMIT 50
      `),
    ])

    return Response.json({
      clients:       clientsRes.rows,
      subscriptions: subsRes.rows,
      advertisers:   advertisersRes.rows,
      campaigns:     campaignsRes.rows,
      events:        eventsRes.rows[0],
      blocks:        blocksRes.rows[0],
      medias:        mediasRes.rows,
    })
  } catch (err) {
    console.error("[admin stats]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
