import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

function normalize(hash: string) {
  return hash.trim().toLowerCase().replace(/^0x/, "")
}

async function main() {
  const { pool } = await import("../lib/db")
  const { anchorMerkleRoot } = await import("../lib/blockchain/anchorMerkleRoot")

  const blockHash = process.argv[2]

  if (!blockHash) {
    throw new Error("Use: npx tsx scripts/anchor-block.ts BLOCK_HASH")
  }

  const normalized = normalize(blockHash)

  console.log("🔍 Searching block:", normalized)

  const { rows } = await pool.query<{
    id: number
    block_hash: string
    merkle_root: string
    tx_hash: string | null
  }>(
    `
    select id, block_hash, merkle_root, tx_hash
    from public.event_blocks
    where lower(replace(block_hash, '0x', '')) = $1
    limit 1
    `,
    [normalized]
  )

  const block = rows[0]

  if (!block) throw new Error("BLOCK_NOT_FOUND")

  console.log("📦 Block found:", {
    id: block.id,
    merkle_root: block.merkle_root,
    tx_hash: block.tx_hash
  })

  if (block.tx_hash) {
    console.log("⚠ Block already anchored:", block.tx_hash)
    return
  }

  console.log("🚀 Anchoring merkle root...")

  const anchored = await anchorMerkleRoot(block.merkle_root, block.id)

  if (!anchored.success) {
    throw new Error(anchored.error ?? "ANCHOR_FAILED")
  }

  console.log("✅ Anchor successful!")
  console.log({
    block_id: block.id,
    tx_hash: anchored.tx_hash,
    block_number: anchored.block_number
  })

  await pool.end()
}

main().catch((err) => {
  console.error("❌ ERROR:", err)
  process.exit(1)
})