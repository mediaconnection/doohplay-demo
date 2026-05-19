import dotenv from "dotenv"
import crypto from "crypto"

dotenv.config({ path: ".env.local" })

type EventRow = {
  id: string
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

async function main() {
  const { pool } = await import("../lib/db")
  const { buildMerkleTree, getMerkleProof } = await import(
    "../lib/domain/proof/merkle"
  )

  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    await client.query(`
      alter table public.event_chain
      add column if not exists merkle_proof jsonb
    `)

    const { rows: events } = await client.query<EventRow>(`
      select id::text, event_hash
      from public.event_chain
      where block_id is null
      order by created_at asc, id asc
      limit 100
      for update skip locked
    `)

    if (events.length === 0) {
      console.log("⚠ No events to process")
      await client.query("COMMIT")
      return
    }

    for (const event of events) {
      if (!isHex64(event.event_hash)) {
        throw new Error(`INVALID_EVENT_HASH:${event.id}`)
      }
    }

    const tree = buildMerkleTree(events.map((event) => event.event_hash))
    const merkleRoot = tree.root

    const lastBlock = await client.query<{ block_hash: string | null }>(`
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

    const inserted = await client.query<{ id: string }>(
      `
      insert into public.event_blocks (
        merkle_root,
        block_hash,
        prev_block_hash,
        created_at
      )
      values ($1, $2, $3, now())
      returning id::text
      `,
      [
        merkleRoot,
        formatHash(blockHash),
        previousHash ? formatHash(previousHash) : null
      ]
    )

    const blockId = inserted.rows[0].id

    for (const event of events) {
      const proof = getMerkleProof(tree, event.event_hash)

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

    console.log("✅ Block finalized successfully")
    console.log({
      block_id: blockId,
      block_hash: formatHash(blockHash),
      merkle_root: merkleRoot,
      events: events.length
    })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("❌ ERROR:", err)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

main()