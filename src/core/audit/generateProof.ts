// @ts-nocheck
import { pool } from "@/lib/db";
import { verifyEventChain } from "./verifyEventChain";
import { buildMerkleRoot } from "./merkleRoot";

export async function generateProof() {

  const chain = await verifyEventChain();

  const res = await pool.query(`
    SELECT
      event_id,
      event_hash,
      previous_event_hash,
      occurred_at
    FROM public.event_chain
    ORDER BY occurred_at ASC
  `);

  const events = res.rows;

  const hashes = events.map((e: Record<string, unknown>) => e.event_hash);

  const merkle_root = buildMerkleRoot(hashes);

  return {
    generated_at: new Date().toISOString(),
    events: events.length,
    chain_valid: chain.valid,
    merkle_root,
    events_hashes: hashes
  };

}
