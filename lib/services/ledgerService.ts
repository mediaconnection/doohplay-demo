import { pool, db } from "@/lib/db";
import { verifyEventHash } from "@/lib/crypto/ledgerVerify";

export type EventRow = {
  event_id: string;
  event_type: string;
  payload: unknown;
  event_hash: string | null;
  previous_hash: string | null;
  merkle_root: string | null;
  signature: string | null;
  block_height: number | null;
  occurred_at: string | Date | null;
};

export type LedgerVerification = {
  event_hash_valid: boolean;
  merkle_valid?: boolean;
  chain_valid?: boolean;
  signature_valid?: boolean;
  valid: boolean;
};

export async function getLedgerEvent(
  event_id: string
): Promise<EventRow | null> {

  if (!event_id || !event_id.trim()) {
    throw new Error("Invalid event_id");
  }

  try {

    const res = await db.query<EventRow>(
      `
      SELECT
        event_id,
        event_type,
        payload,
        event_hash,
        previous_hash,
        merkle_root,
        signature,
        block_height,
        occurred_at
      FROM event_chain
      WHERE event_id = $1
      LIMIT 1
      `,
      [event_id]
    );

    return res.rows[0] ?? null;

  } catch (error) {

    console.error("ledgerService:getLedgerEvent", {
      event_id,
      error
    });

    throw new Error("Failed to load ledger event");

  }

}

export function verifyLedgerEvent(
  event: EventRow
): LedgerVerification {

  const event_hash_valid =
    event.event_hash
      ? verifyEventHash(event)
      : false;

  const valid = event_hash_valid;

  return {

    event_hash_valid,
    merkle_valid: undefined,
    chain_valid: undefined,
    signature_valid: undefined,
    valid

  };

}