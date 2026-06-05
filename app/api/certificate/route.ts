export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"

// Gera PDF do certificado via API Python interna
// Usa o endpoint /api/certificate/generate que chama Python

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get("campaign_id")
    const code = searchParams.get("code") // studio client code

    if (!campaignId && !code) {
      return NextResponse.json({ error: "campaign_id ou code obrigatório" }, { status: 400 })
    }

    // Busca dados da campanha
    let campaignData: any = null
    let plays: any[] = []
    let stats: any = {}

    if (code) {
      // Busca via studio client code
      const clientRes = await pool.query(
        `SELECT sc.*, p.name AS player_name, p.location AS player_location
         FROM studio_clients sc
         LEFT JOIN players p ON p.id = sc.player_id
         WHERE sc.code = $1 AND sc.active = true LIMIT 1`,
        [code.trim().toUpperCase()]
      )
      const client = clientRes.rows[0]
      if (!client) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })

      // Busca campanhas do cliente
      const campRes = await pool.query(
        `SELECT c.* FROM campaigns c
         JOIN display_events e ON e.campaign_id = c.id
         JOIN players p ON p.id = e.player_id
         WHERE p.id = $1
         GROUP BY c.id
         ORDER BY COUNT(e.id) DESC
         LIMIT 1`,
        [client.player_id]
      )

      campaignData = {
        name: campRes.rows[0]?.name || `Campanha ${client.name}`,
        advertiser: client.name,
        player_name: client.player_name || "Tela DOOHPLAY",
        player_id: client.player_id,
        campaign_id: campRes.rows[0]?.id,
      }
    } else {
      const campRes = await pool.query(
        `SELECT c.*, p.name AS player_name, p.location AS player_location
         FROM campaigns c
         LEFT JOIN display_events e ON e.campaign_id = c.id
         LEFT JOIN players p ON p.id = e.player_id
         WHERE c.id = $1
         GROUP BY c.id, p.name, p.location
         LIMIT 1`,
        [campaignId]
      )
      if (!campRes.rows.length) return NextResponse.json({ error: "Campanha não encontrada" }, { status: 404 })
      const camp = campRes.rows[0]
      campaignData = {
        name: camp.name,
        advertiser: camp.advertiser,
        player_name: camp.player_name,
        campaign_id: camp.id,
        start_date: camp.start_date,
        end_date: camp.end_date,
        cpm: camp.cpm,
      }
    }

    // Busca exibições
    const playsRes = await pool.query(
      `SELECT
         e.played_at AT TIME ZONE 'America/Sao_Paulo' AS played_at_local,
         p.name AS player_name,
         e.duration,
         e.event_hash
       FROM display_events e
       LEFT JOIN players p ON p.id = e.player_id
       WHERE ${campaignData.campaign_id ? "e.campaign_id = $1" : "e.player_id = $1"}
       ORDER BY e.played_at DESC
       LIMIT 200`,
      [campaignData.campaign_id || campaignData.player_id]
    )
    plays = playsRes.rows

    // Stats
    const statsRes = await pool.query(
      `SELECT
         COUNT(*)::int AS total_plays,
         SUM(COALESCE(duration, 30))::int AS total_seconds,
         MIN(played_at) AS first_play,
         MAX(played_at) AS last_play
       FROM display_events
       WHERE ${campaignData.campaign_id ? "campaign_id = $1" : "player_id = $1"}`,
      [campaignData.campaign_id || campaignData.player_id]
    )
    stats = statsRes.rows[0]

    const totalSecs = stats.total_seconds || 0
    const hours = Math.floor(totalSecs / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    const totalDuration = hours > 0 ? `${hours}h ${mins}min` : `${mins}min`

    const firstPlay = stats.first_play ? new Date(stats.first_play).toLocaleDateString("pt-BR") : "—"
    const lastPlay = stats.last_play ? new Date(stats.last_play).toLocaleDateString("pt-BR") : "—"

    // Monta payload para o gerador Python
    const certData = {
      cert_number: `${new Date().getFullYear()}-${(code || campaignId || "CERT").toUpperCase().slice(0,6)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      campaign_name: campaignData.name,
      advertiser: campaignData.advertiser,
      period: `${firstPlay} a ${lastPlay}`,
      total_plays: stats.total_plays || 0,
      total_duration: totalDuration,
      screens_count: 1,
      issued_at: new Date().toLocaleDateString("pt-BR"),
      demo_hash: plays[0]?.event_hash || "20ec722b179a772ddc19c2a6053326906da1e598cc3dcaeed4a48efee2f950be",
      plays: plays.slice(0, 10).map(p => ({
        played_at: p.played_at_local ? new Date(p.played_at_local).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—",
        player_name: p.player_name || "Tela DOOHPLAY",
        duration: p.duration || 30,
        event_hash: p.event_hash || "—",
      }))
    }

    // Chama API interna de geração PDF
    const pdfRes = await fetch(`${request.nextUrl.origin}/api/certificate/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(certData),
    })

    if (!pdfRes.ok) throw new Error("Erro ao gerar PDF")

    const pdfBuffer = await pdfRes.arrayBuffer()

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificado-doohplay-${certData.cert_number}.pdf"`,
        "Cache-Control": "no-store",
      }
    })

  } catch (err: any) {
    console.error("Certificate error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
