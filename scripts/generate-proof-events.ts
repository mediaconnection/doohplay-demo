import dotenv from "dotenv";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL not defined");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY not defined");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function sha256(data: string) {
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex");
}

async function generateEvents(total = 1000) {

  console.log(`Generating ${total} proof events...`);

  let previousHash: string | null = null;

  for (let i = 0; i < total; i++) {

    try {

      const payload = {
        campaign_id: crypto.randomUUID(),
        player_id: crypto.randomUUID(),
        location_id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        index: i
      };

      const payloadString = JSON.stringify(payload);

      const eventHash = sha256(payloadString);

      const chainHash = sha256(`${previousHash ?? ""}:${eventHash}`);

      const { data: event, error: eventError } = await supabase
        .from("display_events")
        .insert({
          campaign_id: payload.campaign_id,
          player_id: payload.player_id,
          location_id: payload.location_id,
          played_at: payload.timestamp,
          event_hash: eventHash
        })
        .select()
        .single();

      if (eventError || !event) {
        throw new Error(eventError?.message || "failed to create display_event");
      }

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

      previousHash = chainHash;

      if (i % 100 === 0) {
        console.log(`generated ${i}`);
      }

    } catch (err) {

      console.error("Error generating event", err);
      break;

    }

  }

  console.log("Done generating events.");

}

generateEvents(1000);