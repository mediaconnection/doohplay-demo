export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"
import { runProofEngine } from "@/lib/proof/engine"
import { pool } from "@/lib/db"

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

        results.push({
          proof: {
            ...proof,
            meta: {
              ...proof.meta,
              campaign_name: `Campaign ${event.campaign_id ?? "N/A"}`,
              advertiser_name: "Advertiser",
              updated_at: event.created_at,
              total_events: Math.floor(Math.random() * 20000) // pode substituir depois
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

