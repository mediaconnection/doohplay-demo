import { NextResponse } from "next/server";
import { emitCanonicalEvent } from "@/core/audit/emitCanonicalEvent";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const {
      screen_id,
      campaign_id,
      ad_id
    } = body;

    if (!screen_id || !ad_id) {

      return NextResponse.json(
        { error: "screen_id and ad_id required" },
        { status: 400 }
      );

    }

    const event = await emitCanonicalEvent({

      event_type: "AD_PLAY_START",

      source_table: "display_events",

      source_id: ad_id,

      device_id: screen_id,

      payload: {
        screen_id,
        campaign_id,
        ad_id
      }

    });

    return NextResponse.json({
      success: true,
      event
    });

  } catch (err: any) {

    console.error("AD START ERROR", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );

  }

}