// @ts-nocheck
import { db } from "@/lib/db"

export type UnanchoredEvent = {
  id: string
  event_hash: string
  event_id: string
  signature: string | null
}

export async function getUnanchoredEvents(limit = 500): Promise<UnanchoredEvent[]> {
  const { rows } = await db.query<UnanchoredEvent>(
    `
    SELECT id::text, event_hash, event_id::text, signature
    FROM public.event_chain
    WHERE block_id IS NULL AND event_hash IS NOT NULL AND length(event_hash) = 64 AND event_hash != 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' AND event_hash != 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    ORDER BY created_at ASC
    LIMIT $1
    `,
    [limit]
  )
  return rows
}




