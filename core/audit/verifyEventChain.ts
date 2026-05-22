import { pool, db } from "@/lib/db";

type EventRow = {
  event_id: string;
  event_hash: string;
  previous_event_hash: string | null;
  occurred_at: string;
};

type ChainVerificationResult = {
  valid: boolean;
  checked: number;
  brokenAt?: string;
  reason?: string;
};

export async function verifyEventChain(): Promise<ChainVerificationResult> {

  console.log("🔎 VERIFYING EVENT CHAIN");

  const res = await db.query<EventRow>(`
    SELECT
      event_id,
      event_hash,
      previous_event_hash,
      occurred_at
    FROM public.event_chain
    ORDER BY occurred_at ASC, event_id ASC
  `);

  const events = res.rows;

  // cadeia vazia
  if (events.length === 0) {

    console.log("⚠️ EVENT CHAIN EMPTY");

    return {
      valid: true,
      checked: 0
    };

  }

  // cadeia com 1 evento
  if (events.length === 1) {

    const genesis = events[0];

    if (genesis.previous_event_hash !== null) {

      return {
        valid: false,
        checked: 0,
        brokenAt: genesis.event_id,
        reason: "invalid genesis previous hash"
      };

    }

    console.log("✅ SINGLE GENESIS EVENT");

    return {
      valid: true,
      checked: 1
    };

  }

  let previousHash: string | null = null;

  for (let i = 0; i < events.length; i++) {

    const event = events[i];

    // genesis
    if (i === 0) {

      if (event.previous_event_hash !== null) {

        return {
          valid: false,
          checked: 0,
          brokenAt: event.event_id,
          reason: "invalid genesis previous hash"
        };

      }

      previousHash = event.event_hash;

      continue;

    }

    if (event.previous_event_hash !== previousHash) {

      return {
        valid: false,
        checked: i,
        brokenAt: event.event_id,
        reason: "hash chain mismatch"
      };

    }

    previousHash = event.event_hash;

  }

  console.log("✅ EVENT CHAIN VALID");

  return {
    valid: true,
    checked: events.length
  };

}