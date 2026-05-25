// @ts-nocheck
import { pool } from "@/lib/db";
export { pool } from "@/lib/db";
import { CanonicalEvent } from "./canonicalEvent";

/**
 * Retorna o último hash da cadeia de eventos
 */
export async function getLastEventHash(): Promise<string | null> {
  const res = await pool.query(`
    SELECT event_hash
    FROM public.event_chain
    ORDER BY occurred_at DESC
    LIMIT 1
  `);

  return res.rows[0]?.event_hash ?? null;
}

/**
 * Insere evento imutável na cadeia (ledger)
 */
export async function saveEvent(event: CanonicalEvent): Promise<void> {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    /**
     * Lock da cadeia para evitar race condition
     */
    await client.query(`
      LOCK TABLE public.event_chain IN SHARE ROW EXCLUSIVE MODE
    `);

    const res = await client.query(
      `
      INSERT INTO public.event_chain (
        event_id,
        event_type,
        source_table,
        source_id,
        device_id,
        campaign_id,
        occurred_at,
        payload_hash,
        previous_event_hash,
        event_hash,
        signature
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
      )
      ON CONFLICT (event_id, occurred_at) DO NOTHING
      RETURNING event_id
      `,
      [
        event.event_id,
        event.event_type,
        event.source_table,
        event.source_id,
        event.device_id ?? null,
        event.campaign_id ?? null,
        event.occurred_at,
        event.payload_hash,
        event.previous_event_hash,
        event.event_hash,
        event.signature
      ]
    );

    await client.query("COMMIT");

    /**
     * Se não inseriu, é duplicado (idempotência)
     */
    if (res.rowCount === 0) {
      console.warn("⚠️ Duplicate event ignored", event.event_id);
      return;
    }

    console.log("✅ event_chain INSERT OK", event.event_id);

  } catch (err) {

    await client.query("ROLLBACK");
    throw err;

  } finally {

    client.release();

  }
}
