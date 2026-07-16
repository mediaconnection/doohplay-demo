// app/api/admin/stats/route.ts
import { getPool } from "@/lib/db"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  // Aceita tanto sessão NextAuth quanto secret legacy (retrocompatibilidade)
  const session = await getServerSession(authOptions)
  const secret  = req.nextUrl.searchParams.get("secret")

  const isNextAuth = !!session?.user
  const isLegacy   = secret && secret === process.env.ADMIN_SECRET

  if (!isNextAuth && !isLegacy) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  // Fase 13 — Assinaturas/financeiro é dado sensível, só super_admin recebe
  // de verdade. Secret legacy (cron/automação) sempre trata como super_admin,
  // já que hoje esse secret já dá acesso total a tudo mesmo.
  const isSuperAdmin = isLegacy || (session?.user as any)?.role === "super_admin"

  const pool = getPool()
  try {
    const [clientsRes, subsRes, advertisersRes, campaignsRes, eventsRes, dailyEventsRes, blocksRes, mediasRes, alertsRes, networkMediaRes] = await Promise.all([
      pool.query(`
        SELECT sc.id::text, sc.code, sc.name, sc.business_type, sc.active,
               sc.phone, sc.address, sc.created_at,
               sc.screen_size, sc.price_multiplier,
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
        SELECT to_char(d.day, 'DD/MM') AS day, COALESCE(e.count, 0)::int AS count
        FROM generate_series(CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE, INTERVAL '1 day') AS d(day)
        LEFT JOIN (
          SELECT date_trunc('day', played_at) AS day, COUNT(*)::int AS count
          FROM display_events
          WHERE played_at > NOW() - INTERVAL '14 days'
          GROUP BY 1
        ) e ON e.day = d.day
        ORDER BY d.day
      `).catch(() => ({ rows: [] })),
      pool.query(`
        SELECT COUNT(*)::int AS total,
               COUNT(*) FILTER (WHERE anchored_at IS NOT NULL)::int AS anchored
        FROM event_blocks
      `),
      pool.query(`
        SELECT m.id::text, m.name, m.type, m.status, m.url, m."createdAt",
               m.content_tags,
               c.name AS campaign_name, c."advertiserCode",
               a.name AS advertiser_name, a.phone AS advertiser_phone
        FROM "CampaignMedia" m
        JOIN "Campaign" c ON c.id = m."campaignId"
        JOIN "Advertiser" a ON a.code = c."advertiserCode"
        ORDER BY m."createdAt" DESC
        LIMIT 50
      `),
      pool.query(`
        SELECT
          dsa.id::text, dsa.phone, dsa.studio_client_code, dsa.advertiser_code,
          dsa.detected_at, dsa.resolved,
          sc.name AS studio_client_name,
          a.name  AS advertiser_name
        FROM duplicate_signup_alerts dsa
        LEFT JOIN studio_clients sc ON sc.code = dsa.studio_client_code
        LEFT JOIN "Advertiser" a    ON a.code  = dsa.advertiser_code
        ORDER BY dsa.detected_at DESC
        LIMIT 50
      `).catch(() => ({ rows: [] })), // tolera tabela ainda não migrada
      pool.query(`
        SELECT nm.id, nm.name, nm.type, nm.url, nm.status, nm.created_at, nm.owner_code,
               sc.name AS owner_name,
               (SELECT COUNT(*)::int FROM network_partnerships np
                WHERE np.status = 'accepted' AND (np.requester_code = nm.owner_code OR np.partner_code = nm.owner_code)
               ) AS partner_count
        FROM network_media nm
        LEFT JOIN studio_clients sc ON sc.code = nm.owner_code
        ORDER BY nm.created_at DESC
        LIMIT 50
      `).catch(() => ({ rows: [] })),
    ])

    return Response.json({
      clients:       clientsRes.rows,
      subscriptions: isSuperAdmin ? subsRes.rows : [],
      advertisers:   advertisersRes.rows,
      // Fase 13 — valor de investimento é dado financeiro, mesma lógica de
      // subscriptions: quem não é super_admin recebe as campanhas sem o
      // campo de orçamento (não só escondido na tela, removido de verdade).
      campaigns:     isSuperAdmin ? campaignsRes.rows : campaignsRes.rows.map(({ budget, ...rest }: any) => rest),
      events:        eventsRes.rows[0],
      dailyEvents:   dailyEventsRes.rows,
      blocks:        blocksRes.rows[0],
      medias:        mediasRes.rows,
      duplicateAlerts: alertsRes.rows,
      networkMedia: networkMediaRes.rows,
    })
  } catch (err) {
    console.error("[admin stats]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
