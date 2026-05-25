export const dynamic = 'force-dynamic';
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function sha256(data: string) {
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex");
}

export async function GET(req: Request) {

  try {

    const url = new URL(req.url);
    const hash = url.searchParams.get("hash");

    if (!hash) {
      return Response.json(
        { error: "hash required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const result: any = {
      valid: true,
      layers: {}
    };

    // --------------------------------------------------
    // 1️⃣ EVENT
    // --------------------------------------------------

    const { data: event } = await supabase
      .from("display_events")
      .select("*")
      .eq("event_hash", hash)
      .maybeSingle();

    if (!event) {

      result.valid = false;
      result.layers.event = false;

      return Response.json(result);

    }

    result.layers.event = true;

    // --------------------------------------------------
    // 2️⃣ PROOF CHAIN
    // --------------------------------------------------

    const { data: chain } = await supabase
      .from("proof_chain")
      .select("*")
      .eq("event_hash", hash)
      .maybeSingle();

    if (!chain) {

      result.valid = false;
      result.layers.proof_chain = false;

      return Response.json(result);

    }

    const expectedChainHash = sha256(
      `${chain.previous_hash ?? ""}:${chain.event_hash}`
    );

    result.layers.proof_chain =
      chain.chain_hash === expectedChainHash;

    if (!result.layers.proof_chain) {
      result.valid = false;
    }

    // --------------------------------------------------
    // 3️⃣ MERKLE
    // --------------------------------------------------

    if (chain.merkle_batch_id) {

      const { data: batch } = await supabase
        .from("proof_merkle_batches")
        .select("*")
        .eq("id", chain.merkle_batch_id)
        .maybeSingle();

      if (batch) {

        result.layers.merkle = true;
        result.batch = batch.id;

      } else {

        result.layers.merkle = false;
        result.valid = false;

      }

    } else {

      result.layers.merkle = false;

    }

    // --------------------------------------------------
    // 4️⃣ TSA
    // --------------------------------------------------

    if (result.batch) {

      const { data: batch } = await supabase
        .from("proof_merkle_batches")
        .select("tsa_token, tsa_time")
        .eq("id", result.batch)
        .maybeSingle();

      result.layers.tsa = !!batch?.tsa_token;

    } else {

      result.layers.tsa = false;

    }

    return Response.json(result);

  } catch (err: any) {

    return Response.json(
      { error: err.message },
      { status: 500 }
    );

  }

}
