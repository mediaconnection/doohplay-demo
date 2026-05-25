export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server"
import { processAudienceEvent } from "@/lib/audience/processAudienceEvent"

export async function POST(req: Request) {

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
