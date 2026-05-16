import { Worker } from "bullmq"
import { connection } from "../redis"
import { pool } from "@/lib/db"
import {
  buildMerkleTree,
  getMerkleProof
} from "@/lib/domain/proof/merkle"
import { signBlockHash } from "@/lib/domain/proof/signICP"
import crypto from "crypto"

type EventRow = {
  id: string
  event_id: string
  event_hash: string
}

function normalizeHash(value: string | null | undefined): string {
  return String(value ?? "").trim().toLowerCase().replace(/^0x/, "")
}

function formatHash(value: string): string {
  return `0x${normalizeHash(value)}`
}

function isHex64(value: string | null | undefined): boolean {
  return /^[a-f0-9]{64}$/i.test(normalizeHash(value))
}

function hashBlock(input: {
  previousHash: string | null
  merkleRoot: string
  firstEventHash: string
  lastEventHash: string
  eventCount: number
}): string {
  const payload = JSON.stringify({
    previous_hash: normalizeHash(input.previousHash),
    merkle_root: normalizeHash(input.merkleRoot),
    first_event_hash: normalizeHash(input.firstEventHash),
    last_event_hash: normalizeHash(input.lastEventHash),
    event_count: input.eventCount
  })

  return crypto.createHash("sha256").update(payload).digest("hex")
}

export const blockWorker = new Worker(
  "block-finalization",
  async () => {
    const client = await pool.connect()

    try {
      await client.query("BEGIN")

      await client.query(`
        alter table public.event_chain
        add column if not exists merkle_proof jsonb
      `)

      const res = await client.query<EventRow>(`
        select id::text, event_id::text, event_hash
        from public.event_chain
        where block_id is null
        order by created_at asc, id asc
        limit 100
        for update skip locked
      `)

      if (res.rows.length === 0) {
        await client.query("COMMIT")
        return {
          skipped: true,
          reason: "NO_EVENTS"
        }
      }

      const events = res.rows

      for (const event of events) {
        if (!isHex64(event.event_hash)) {
          throw new Error(`INVALID_EVENT_HASH:${event.event_id}`)
        }
      }

      const eventHashes = events.map((event) => event.event_hash)
      const tree = buildMerkleTree(eventHashes)
      const merkleRoot = tree.root

      const lastBlock = await client.query<{
        block_hash: string | null
      }>(`
        select block_hash
        from public.event_blocks
        order by created_at desc, id desc
        limit 1
      `)

      const previousHash = lastBlock.rows[0]?.block_hash ?? null

      const blockHash = hashBlock({
        previousHash,
        merkleRoot,
        firstEventHash: events[0].event_hash,
        lastEventHash: events[events.length - 1].event_hash,
        eventCount: events.length
      })

      const existing = await client.query<{ id: string }>(
        `
        select id::text
        from public.event_blocks
        where lower(replace(block_hash, '0x', '')) = $1
        limit 1
        `,
        [blockHash]
      )

      if (existing.rows.length > 0) {
        const existingBlockId = existing.rows[0].id

        for (const event of events) {
          const proof = getMerkleProof(eventHashes, event.event_hash)

          await client.query(
            `
            update public.event_chain
            set
              block_id = $1,
              merkle_proof = $2::jsonb
            where id = $3
            `,
            [existingBlockId, JSON.stringify(proof), event.id]
          )
        }

        await client.query("COMMIT")

        return {
          reused: true,
          block_id: existingBlockId,
          block_hash: formatHash(blockHash),
          merkle_root: merkleRoot,
          size: events.length
        }
      }

      let signature: string | null = null

      try {
        const signResult = await signBlockHash(formatHash(blockHash))
        signature = signResult?.signature ?? null
      } catch (err) {
        console.warn("BLOCK_SIGNATURE_SKIPPED", err)
      }

      const inserted = await client.query<{ id: string }>(
        `
        insert into public.event_blocks (
          merkle_root,
          block_hash,
          prev_block_hash,
          signature,
          created_at
        )
        values ($1, $2, $3, $4, now())
        returning id::text
        `,
        [
          merkleRoot,
          formatHash(blockHash),
          previousHash ? formatHash(previousHash) : null,
          signature
        ]
      )

      const blockId = inserted.rows[0].id

      for (const event of events) {
        const proof = getMerkleProof(eventHashes, event.event_hash)

        await client.query(
          `
          update public.event_chain
          set
            block_id = $1,
            merkle_proof = $2::jsonb
          where id = $3
          `,
          [blockId, JSON.stringify(proof), event.id]
        )
      }

      await client.query("COMMIT")

      return {
        block_id: blockId,
        block_hash: formatHash(blockHash),
        merkle_root: merkleRoot,
        size: events.length
      }
    } catch (err) {
      await client.query("ROLLBACK")
      console.error("❌ Block worker failed:", err)
      throw err
    } finally {
      client.release()
    }
  },
  {
    connection,
    concurrency: 1
  }
)