export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const { processAudienceEvent } = await import("@/lib/audience/processAudienceEvent")


  try {

    const body = await req.json()

    const result = await processAudienceEvent({
      screen_id: body.screen_id,
      campaign_id: body.campaign_id,
      faces: body.faces,
      attention: body.attention,
      dwell_time: body.dwell_time,
      demographics: body.demographics
    })

    return NextResponse.json({
      success: true,
      event_hash: result.hash
    })

  } catch (err) {

    console.error(err)

    return NextResponse.json(
      { error: "failed to process audience event" },
      { status: 500 }
    )
  }
}

