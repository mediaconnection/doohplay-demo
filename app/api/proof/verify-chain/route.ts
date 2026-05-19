import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function sha256(data: string) {
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex");
}

export async function GET() {

  try {

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: chain, error } = await supabase
      .from("proof_chain")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    if (!chain || chain.length === 0) {
      return Response.json({
        valid: true,
        checked: 0
      });
    }

    let previousHash: string | null = null;
    let checked = 0;

    for (const entry of chain) {

      const expected = sha256(
        `${previousHash ?? ""}:${entry.event_hash}`
      );

      if (entry.chain_hash !== expected) {

        return Response.json({
          valid: false,
          checked,
          brokenAt: entry.id,
          reason: "event_hash mismatch"
        });

      }

      previousHash = entry.chain_hash;
      checked++;

    }

    return Response.json({
      valid: true,
      checked
    });

  } catch (err: any) {

    return Response.json(
      { error: err.message || "verification failed" },
      { status: 500 }
    );

  }

}