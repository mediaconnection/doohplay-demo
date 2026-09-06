import dotenv from "dotenv"
import crypto from "crypto"

// Must run before any lib imports so DATABASE_URL is set when pg.Pool initializes
dotenv.config({ path: ".env.local" })

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

function sep(title: string) {
  console.log(`\n--- ${title} ---`)
}

async function main() {
  // Dynamic imports: evaluated after dotenv.config(), so DATABASE_URL is already set
  const { pool } = await import("../lib/db")
  const { appendEventToLedger } = await import("../lib/domain/ledger/appendEvent")
  const { runProofChainAggregator } = await import("../packages/proof-engine/proof/aggregator/proofChainAggregator")

  const eventId = crypto.randomUUID()
  const campaignId = crypto.randomUUID()
  const screenId = `screen-test-${Date.now()}`

  const payload = {
    event_type: "media_played",
    campaign_id: campaignId,
    screen_id: screenId,
    player_id: "player-test-01",
    creative_id: "creative-test-01",
    duration_seconds: 15,
    played_at: new Date().toISOString(),
    source: "test-play-event-script",
  }

  const payloadHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex")

  // --------------------------------------------------------
  // Step 1: append event to ledger
  // --------------------------------------------------------
  sep("Step 1: Appending event to event_chain")
  console.log("event_id :", eventId)
  console.log("payload  :", JSON.stringify(payload, null, 2))

  const row = await appendEventToLedger({
    event_id: eventId,
    hash: payloadHash,
    payload,
  })

  if (!row) throw new Error("appendEventToLedger returned no row")

  const eventHash: string = row.event_hash
  console.log("event_hash (chain) :", eventHash)
  console.log("prev_hash          :", row.prev_hash ?? "(genesis — first event in chain)")

  // --------------------------------------------------------
  // Step 2: run proof chain aggregator
  // --------------------------------------------------------
  sep("Step 2: Running proof chain aggregator")

  const result = await runProofChainAggregator()

  console.log("events_processed :", result.events_processed)
  console.log("block_id         :", result.block_id)
  console.log("merkle_root      :", result.merkle_root)
  console.log("tx_hash          :", result.tx_hash ?? "(not anchored — blockchain may be unreachable in dev)")
  console.log("tsa_ok           :", result.tsa_ok)
  console.log("skipped          :", result.skipped)

  if (result.error) {
    console.error("aggregator error :", result.error)
  }

  // --------------------------------------------------------
  // Step 3: verify URLs
  // --------------------------------------------------------
  sep("Step 3: Verification URLs")

  const verifyUrl    = `${BASE_URL}/verify/${eventHash}`
  const apiVerifyUrl = `${BASE_URL}/api/verify/${eventHash}`

  console.log("Verify page :", verifyUrl)
  console.log("Verify API  :", apiVerifyUrl)

  if (result.skipped) {
    console.warn("\nWARN: aggregator found no unanchored events after the insert.")
    console.warn("The event may have already been picked up by a previous run.")
  } else {
    console.log("\nEnd-to-end test complete.")
    console.log("Open the verify URL in a browser to inspect the full proof layers.")
  }

  await pool.end()
}

main().catch((err) => {
  console.error("FATAL:", err)
  process.exit(1)
})
