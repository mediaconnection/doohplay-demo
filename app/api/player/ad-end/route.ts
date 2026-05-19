import { NextResponse } from "next/server";
import { emitCanonicalEvent } from "@/core/audit/emitCanonicalEvent";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const {
      screen_id,
      campaign_id,
      ad_id,
      duration
    } = body;

    if (!screen_id || !campaign_id || !ad_id) {

      return NextResponse.json(
        { error: "screen_id, campaign_id and ad_id required" },
        { status: 400 }
      );

    }

    const safeDuration =
      typeof duration === "number" && duration >= 0
        ? duration
        : 0;

    console.log("AD_PLAY_END received", {
      screen_id,
      campaign_id,
      ad_id,
      duration: safeDuration
    });

    const event = await emitCanonicalEvent({

      event_type: "AD_PLAY_END",

      source_table: "display_events",

      source_id: ad_id,

      device_id: screen_id,

      payload: {
        screen_id,
        campaign_id,
        ad_id,
        duration: safeDuration
      }

    });

    return NextResponse.json({
      success: true,
      event
    });

  } catch (err: any) {

    console.error("AD END ERROR", err);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );

  }

}