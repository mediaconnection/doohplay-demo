import dotenv from "dotenv"
import crypto from "crypto"

dotenv.config({ path: ".env.local" })

type EventRow = {
  id: string
  event_hash: string
}

type ProofNode = {
  hash: string
  position: "left" | "right"
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

function sha256Pair(left: string, right: string): string {
  return crypto
    .createHash("sha256")
    .update(
      Buffer.concat([
        Buffer.from(normalizeHash(left), "hex"),
        Buffer.from(normalizeHash(right), "hex")
      ])
    )
    .digest("hex")
}

function buildMerkleLevels(hashes: string[]): string[][] {
  const leaves = hashes.map(normalizeHash)

  if (leaves.length === 0) {
    throw new Error("NO_LEAVES")
  }

  const levels: string[][] = [leaves]

  while (levels[levels.length - 1].length > 1) {
    const current = levels[levels.length - 1]
    const next: string[] = []

    for (let i = 0; i < current.length; i += 2) {
      const left = current[i]
      const right = current[i + 1] ?? current[i]
      next.push(sha256Pair(left, right))
    }

    levels.push(next)
  }

  return levels
}

function getMerkleProof(levels: string[][], leafIndex: number): ProofNode[] {
  const proof: ProofNode[] = []
  let index = leafIndex

  for (let level = 0; level < levels.length - 1; level += 1) {
    const current = levels[level]
    const isRightNode = index % 2 === 1
    const siblingIndex = isRightNode ? index - 1 : index + 1
    const sibling = current[siblingIndex] ?? current[index]

    proof.push({
      hash: formatHash(sibling),
      position: isRightNode ? "left" : "right"
    })

    index = Math.floor(index / 2)
  }

  return proof
}

async function main() {
  const { pool } = await import("../lib/db")
  const client = await pool.connect()

  try {
    await client.query("begin")

    await client.query(`
      alter table public.event_chain
      add column if not exists merkle_proof jsonb
    `)

    const { rows: blocks } = await client.query<{
      id: string
      merkle_root: string
      block_hash: string
    }>(`
      select id::text, merkle_root, block_hash
      from public.event_blocks
      where merkle_root is not null
      order by id asc
    `)

    console.log(`🔍 Blocks found: ${blocks.length}`)

    let updatedEvents = 0
    let skippedBlocks = 0
    let forcedBlocks = 0

    for (const block of blocks) {
      const expectedRoot = normalizeHash(block.merkle_root)

      if (!isHex64(expectedRoot)) {
        console.warn("⚠ Skipping block with invalid root:", block.id)
        skippedBlocks += 1
        continue
      }

      const { rows: events } = await client.query<EventRow>(
        `
        select id::text, event_hash
        from public.event_chain
        where block_id = $1
        order by created_at asc, id asc
        `,
        [block.id]
      )

      if (events.length === 0) {
        console.warn("⚠ Skipping empty block:", block.id)
        skippedBlocks += 1
        continue
      }

      for (const event of events) {
        if (!isHex64(event.event_hash)) {
          throw new Error(
            `INVALID_EVENT_HASH block=${block.id} event=${event.id}`
          )
        }
      }

      const levels = buildMerkleLevels(events.map((event) => event.event_hash))
      const computedRoot = levels[levels.length - 1][0]

      if (computedRoot !== expectedRoot) {
        console.warn("⚠ FORCING PROOF despite root mismatch:", {
          block_id: block.id,
          expected: formatHash(expectedRoot),
          computed: formatHash(computedRoot),
          events: events.length
        })

        forcedBlocks += 1
      }

      for (let i = 0; i < events.length; i += 1) {
        const proof = getMerkleProof(levels, i)

        await client.query(
          `
          update public.event_chain
          set merkle_proof = $1::jsonb
          where id = $2
          `,
          [JSON.stringify(proof), events[i].id]
        )

        updatedEvents += 1
      }

      console.log("✅ Backfilled block:", {
        block_id: block.id,
        events: events.length,
        expected_root: formatHash(expectedRoot),
        computed_root: formatHash(computedRoot),
        forced: computedRoot !== expectedRoot
      })
    }

    await client.query("commit")

    console.log("🎉 Backfill complete:", {
      blocks: blocks.length,
      skipped_blocks: skippedBlocks,
      forced_blocks: forcedBlocks,
      updated_events: updatedEvents
    })
  } catch (err) {
    await client.query("rollback")
    console.error("❌ Backfill failed:", err)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

main()