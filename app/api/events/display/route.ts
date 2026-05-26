export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function sha256(data: string) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const {
      screen_id,
      campaign_id = null,
      asset_url = null,
      timestamp = new Date().toISOString()
    } = body;

    if (!screen_id) {
      return Response.json(
        { error: "screen_id required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ------------------------------------------------
    // EVENT PAYLOAD
    // ------------------------------------------------

    const payload = JSON.stringify({
      screen_id,
      campaign_id,
      asset_url,
      timestamp
    });

    const eventHash = sha256(payload);

    // ------------------------------------------------
    // LAST CHAIN HASH
    // ------------------------------------------------

    const { data: last, error: lastError } = await supabase
      .from("proof_chain")
      .select("chain_hash")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastError) {
      throw new Error(lastError.message);
    }

    const previousHash = last?.chain_hash ?? null;

    const chainHash = sha256(
      `${previousHash ?? ""}:${eventHash}`
    );

    // ------------------------------------------------
    // DISPLAY EVENT
    // ------------------------------------------------

    const { data: event, error: eventError } = await supabase
      .from("display_events")
      .insert({
        screen_id,
        campaign_id,
        asset_url,
        played_at: timestamp,
        duration: 10,
        event_payload: payload,
        event_hash: eventHash
      })
      .select()
      .single();

    if (eventError || !event) {
      throw new Error(eventError?.message || "failed to create display event");
    }

    // ------------------------------------------------
    // PROOF CHAIN
    // ------------------------------------------------

    const { error: chainError } = await supabase
      .from("proof_chain")
      .insert({
        event_id: event.id,
        event_hash: eventHash,
        previous_hash: previousHash,
        chain_hash: chainHash
      });

    if (chainError) {
      throw new Error(chainError.message);
    }

    // ------------------------------------------------
    // RESPONSE
    // ------------------------------------------------

    return Response.json({
      success: true,
      event_id: event.id,
      event_hash: eventHash,
      chain_hash: chainHash
    });

  } catch (err: any) {

    console.error("DISPLAY EVENT ERROR:", err);

    return Response.json(
      { error: err.message ?? "internal error" },
      { status: 500 }
    );

  }

}

