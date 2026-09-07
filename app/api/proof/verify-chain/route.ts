export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import crypto from "crypto";
// Etapa 2, item 3, sub-parte 2, Fase 5 (2026-09-06): reusa o client
// oficial de service-role em vez de instanciar o próprio.
import { supabaseAdmin as supabase } from "@/lib/supabaseServer";

function sha256(data: string) {
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex");
}

export async function GET() {

  try {

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

