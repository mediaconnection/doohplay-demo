import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config({ path: ".env.local" });

function sha256(data: string) {
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex");
}

async function generateEvents(total = 1000) {
  // Etapa 2, item 3, sub-parte 2 (2026-09-06): reusa o client oficial de
  // service-role em vez de instanciar o próprio. Import dinâmico, não
  // estático: imports estáticos são "hoisted" em ESM e o módulo seria
  // avaliado (e suas checagens de env var lançariam) antes do
  // dotenv.config({ path: ".env.local" }) acima rodar de verdade -- mesmo
  // padrão já usado em scripts/test-play-event.ts.
  const { supabaseAdmin: supabase } = await import("../lib/supabaseServer");

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