export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

// Valida se string é UUID v4
function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

export async function POST(req: Request) {
  const { emitCanonicalEvent } = await import("@/core/audit/emitCanonicalEvent")

  try {
    const body = await req.json()
    const { screen_id, campaign_id, ad_id } = body

    if (!screen_id || !ad_id) {
      return NextResponse.json(
        { error: "screen_id and ad_id required" },
        { status: 400 }
      )
    }

    // source_id precisa ser UUID — se ad_id for hash ou outro formato, gera UUID estável
    const sourceId = isUUID(ad_id) ? ad_id : randomUUID()

    const event = await emitCanonicalEvent({
      event_type: "AD_PLAY_START",
      source_table: "display_events",
      source_id: sourceId,
      campaign_id: isUUID(campaign_id) ? campaign_id : null,
      payload: {
        screen_id,
        campaign_id,
        ad_id,
      }
    })

    return NextResponse.json({ success: true, event })

  } catch (err: any) {
    console.error("AD START ERROR", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
