import { getPool } from "@/lib/db"
import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  if (!code) return Response.json({ slides: [] })

  const pool = getPool()

  try {
    const clientRes = await pool.query(
      `SELECT name, player_id FROM studio_clients WHERE code = $1 LIMIT 1`,
      [code.toUpperCase()]
    )

    if (clientRes.rows.length === 0) {
      return Response.json({ slides: [], error: "Cliente não encontrado" })
    }

    const client = clientRes.rows[0]

    // Busca mídias aprovadas das campanhas ativas
    const mediaRes = await pool.query(`
      SELECT m.id::text, m.url, m.type, m.name, c.name AS campaign_name
      FROM "CampaignMedia" m
      JOIN "Campaign" c ON c.id = m."campaignId"
      JOIN "Advertiser" a ON a.code = c."advertiserCode"
      JOIN "CampaignScreen" cs ON cs."campaignId" = c.id
      WHERE m.status = 'approved'
        AND c.status = 'active'
        AND c."startDate" <= NOW()
        AND c."endDate" >= NOW()
      ORDER BY RANDOM()
      LIMIT 10
    `)

    const slides = []

    // Slide de boas-vindas do cliente
    slides.push({
      id: "welcome",
      type: "text",
      title: client.name,
      subtitle: "Bem-vindo!",
      duration: 6000,
      bg: "#0B1020",
    })

    // Mídias aprovadas
    for (const m of mediaRes.rows) {
      slides.push({
        id: m.id,
        type: m.type,
        url: m.url,
        title: m.campaign_name,
        duration: m.type === "video" ? 30000 : 10000,
      })
    }

    // Se não tiver mídias, slides padrão
    if (mediaRes.rows.length === 0) {
      slides.push({
        id: "default",
        type: "text",
        title: "Anúncios em breve",
        subtitle: "Seu espaço publicitário está disponível",
        duration: 8000,
        bg: "#111827",
      })
    }

    return Response.json({ slides, name: client.name })
  } catch (err) {
    console.error("[playlist]", err)
    return Response.json({ slides: [], error: String(err) })
  }
}
