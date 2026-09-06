export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"

/* =========================
   TYPES
========================= */

type DashboardItem = {
  proof: any
}

/* =========================
   GET
========================= */

export async function GET() {
    const { pool } = await import("@/lib/db")

    const { runProofEngine } = await import("@proof-engine/proof/engine")

  try {
    /* =========================
       BUSCAR EVENTOS RECENTES
    ========================= */

    const res = await pool.query(`
      SELECT
        event_id,
        event_hash,
        entity_type,
        campaign_id,
        created_at
      FROM event_chain
      ORDER BY created_at DESC
      LIMIT 20
    `)

    const events = res.rows

    if (!events.length) {
      return NextResponse.json({ items: [] })
    }

    /* =========================
       EXECUTAR ENGINE
    ========================= */

    const results: DashboardItem[] = []

    for (const event of events) {
      try {
        const proof = await runProofEngine({
          hash: event.event_hash,
          entity_id: event.event_id,
          entity_type: event.entity_type
        })

        // Contagem REAL de eventos da campanha (antes era Math.random() —
        // violava o princípio "nunca dado simulado em produção" bem no meio
        // do sistema que deveria ser a prova de verdade).
        let totalEvents = 0
        if (event.campaign_id) {
          const countRes = await pool.query(
            `SELECT COUNT(*)::int AS total FROM event_chain WHERE campaign_id = $1`,
            [event.campaign_id]
          )
          totalEvents = countRes.rows[0]?.total ?? 0
        }

        // Nome REAL da campanha via join — antes era hardcoded "Advertiser"/
        // template string, não refletia dado nenhum de verdade.
        let campaignName = event.campaign_id ? `Campaign ${event.campaign_id}` : "N/A"
        if (event.campaign_id) {
          const campaignRes = await pool.query(
            `SELECT name FROM campaigns WHERE id = $1 LIMIT 1`,
            [event.campaign_id]
          )
          if (campaignRes.rows[0]?.name) campaignName = campaignRes.rows[0].name
        }

        results.push({
          proof: {
            ...proof,
            meta: {
              ...proof.meta,
              campaign_name: campaignName,
              // advertiser_name removido — esse schema (tabela "campaigns")
              // não guarda nome de anunciante; mostrar um valor real
              // exigiria juntar com o sistema de Campaign/CampaignMedia
              // (mundo diferente, ver nota na Fase 1 do roteiro mestre).
              // Melhor omitir do que fingir com string fixa.
              updated_at: event.created_at,
              total_events: totalEvents
            }
          }
        })
      } catch (err) {
        results.push({
          proof: {
            status: "FAILED",
            score: 0,
            reasons: ["ENGINE_ERROR"],
            layers: [],
            meta: {
              entity_id: event.event_id,
              updated_at: event.created_at
            }
          }
        })
      }
    }

    return NextResponse.json({
      items: results
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "dashboard_failed",
        message: error instanceof Error ? error.message : "unknown_error"
      },
      { status: 500 }
    )
  }
}

