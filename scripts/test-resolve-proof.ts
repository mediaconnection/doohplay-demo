import "dotenv/config"
import { resolveProofInputByHash } from "../packages/proof-engine/proof/adapters/supabase"

function normalize(hash: string) {
  return hash.trim().toLowerCase().replace(/^0x/, "")
}

async function test(hash: string) {
  try {
    const result = await resolveProofInputByHash(hash, {
      entity_type: "event"
    })

    console.log("----")
    console.log("INPUT:", hash)
    console.log("NORMALIZED:", normalize(hash))
    console.log("RESULT:", result)
  } catch (err: any) {
    console.error("ERROR for hash:", hash)
    console.error(err?.message || err)
  }
}

async function main() {
  const base =
    "46ffdec8af06754c0525420c393fe5932b053dc9148e3bc2e010c63860bbcd0c"

  const hashes = [
    base,
    `0x${base}`
  ]

  console.log("🚀 Testing resolveProofInputByHash...\n")

  for (const h of hashes) {
    await test(h)
  }

  console.log("\n✅ Done")
}

main().catch((err) => {
  console.error("FATAL:", err)
  process.exit(1)
})