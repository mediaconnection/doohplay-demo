import "dotenv/config"
import { Client } from "pg"
import { createHash, randomUUID } from "crypto"

import { createSignedEventRecord } from "../packages/proof-engine/domain/proof/createSignedEventRecord"
import {
  buildMerkleProof,
  buildMerkleRoot,
  normalizeHash
} from "../packages/proof-engine/domain/proof/merkleBatch"

type ProofNode = {
  position: "left" | "right"
  hash: string
}

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://dooh:doohpass@127.0.0.1:55432/doohplay"

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex")
}

function with0x(value: string): string {
  return `0x${normalizeHash(value)}`
}

async function ensureColumns(client: Client) {
  await client.query(`
    ALTER TABLE public.event_chain
    ADD COLUMN IF NOT EXISTS merkle_proof JSONB,
    ADD COLUMN IF NOT EXISTS signature TEXT,
    ADD COLUMN IF NOT EXISTS signature_algorithm TEXT,
    ADD COLUMN IF NOT EXISTS digest_algorithm TEXT,
    ADD COLUMN IF NOT EXISTS signature_encoding TEXT,
    ADD COLUMN IF NOT EXISTS certificate_fingerprint TEXT,
    ADD COLUMN IF NOT EXISTS certificate_subject TEXT,
    ADD COLUMN IF NOT EXISTS certificate_issuer TEXT,
    ADD COLUMN IF NOT EXISTS certificate_serial_number TEXT,
    ADD COLUMN IF NOT EXISTS certificate_valid_from TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS certificate_valid_to TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS certificate_days_remaining INTEGER,
    ADD COLUMN IF NOT EXISTS proof_payload_hash TEXT,
    ADD COLUMN IF NOT EXISTS proof_payload_canonical TEXT,
    ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ
  `)
}

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: false
  })

  await client.connect()

  try {
    await client.query("BEGIN")
    await ensureColumns(client)

    const prevBlock = await client.query<{ block_hash: string }>(`
      SELECT block_hash
      FROM public.event_blocks
      ORDER BY id DESC
      LIMIT 1
    `)

    const prevBlockHash = prevBlock.rows[0]?.block_hash ?? null
    const baseTime = new Date()

    const latestEvent = await client.query<{ event_hash: string | null }>(`
      SELECT event_hash
      FROM public.event_chain
      WHERE event_hash IS NOT NULL
      ORDER BY created_at DESC NULLS LAST, occurred_at DESC NULLS LAST
      LIMIT 1
      FOR UPDATE
    `)

    let previousEventHash = latestEvent.rows[0]?.event_hash ?? null

    const records = []

    /* =========================
       CREATE SIGNED EVENTS
    ========================= */

    for (let index = 0; index < 4; index++) {
      const sourceId = randomUUID()

      const payload = {
        test: true,
        kind: "DOOHPLAY_MERKLE_PROOF_TEST",
        event_index: index + 1,
        campaign_id: `campaign-test-${index + 1}`,
        device_id: `device-test-${index + 1}`,
        occurred_at: new Date(baseTime.getTime() + index * 1000).toISOString()
      }

      const record = createSignedEventRecord({
        eventType: "TEST_IMPRESSION",
        sourceTable: "test_merkle_block",
        sourceId,
        deviceId: String(payload.device_id),
        campaignId: String(payload.campaign_id),
        occurredAt: String(payload.occurred_at),
        previousEventHash,
        payload
      })

      records.push(record)
      previousEventHash = record.event_hash
    }

    /* =========================
       MERKLE
    ========================= */

    const leafHashes = records.map((r) => normalizeHash(r.event_hash))
    const merkleRoot = buildMerkleRoot(leafHashes)

    if (!merkleRoot) {
      throw new Error("Falha ao gerar merkle_root")
    }

    const blockHash = with0x(
      sha256Hex(
        JSON.stringify({
          merkle_root: with0x(merkleRoot),
          prev_block_hash: prevBlockHash,
          event_count: records.length,
          created_at: baseTime.toISOString()
        })
      )
    )

    const blockResult = await client.query<{ id: string }>(
      `
      INSERT INTO public.event_blocks (
        merkle_root,
        block_hash,
        prev_block_hash,
        signature,
        created_at,
        tx_hash,
        network,
        anchored_at,
        block_timestamp
      )
      VALUES ($1, $2, $3, $4, now(), null, $5, null, $6)
      RETURNING id
      `,
      [
        with0x(merkleRoot),
        blockHash,
        prevBlockHash,
        "LOCAL_TEST_SIGNATURE",
        "local-test",
        Date.now()
      ]
    )

    const blockId = Number(blockResult.rows[0].id)

    const chainIndexResult = await client.query<{ next_index: string }>(`
      SELECT COALESCE(MAX(chain_index), 0) + 1 AS next_index
      FROM public.event_chain
    `)

    let chainIndex = Number(chainIndexResult.rows[0]?.next_index ?? 1)

    /* =========================
       INSERT EVENTS
    ========================= */

    for (const record of records) {
      const proof = buildMerkleProof(leafHashes, record.event_hash)

      if (!proof) {
        throw new Error(`Falha ao gerar proof para ${record.event_hash}`)
      }

      const eventId = randomUUID()

      await client.query(
        `
        INSERT INTO public.event_chain (
          event_id,
          event_type,
          source_table,
          source_id,
          device_id,
          campaign_id,
          occurred_at,
          payload,
          payload_hash,
          previous_event_hash,
          event_hash,

          signature,
          signature_algorithm,
          signature_encoding,
          digest_algorithm,

          certificate_fingerprint,
          certificate_subject,
          certificate_issuer,
          certificate_serial_number,
          certificate_valid_from,
          certificate_valid_to,
          certificate_days_remaining,

          proof_payload_hash,
          proof_payload_canonical,
          signed_at,

          created_at,
          chain_index,
          block_height,
          block_id,
          tx_hash,
          anchored_at,
          client_id,
          trust_score,
          merkle_proof
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7::timestamptz,$8::jsonb,$9,$10,$11,
          $12,$13,$14,$15,
          $16,$17,$18,$19,$20::timestamptz,$21::timestamptz,$22,
          $23,$24,$25::timestamptz,
          now(),$26,$27,$28,null,null,$29,$30,$31::jsonb
        )
        `,
        [
          eventId,
          record.event_type,
          record.source_table,
          record.source_id,
          record.device_id,
          record.campaign_id,
          record.occurred_at,
          JSON.stringify(record.payload),
          record.payload_hash,
          record.previous_event_hash,
          record.event_hash,

          record.signature,
          record.signature_algorithm,
          record.signature_encoding,
          record.digest_algorithm,

          record.certificate_fingerprint,
          record.certificate_subject,
          record.certificate_issuer,
          record.certificate_serial_number,
          record.certificate_valid_from,
          record.certificate_valid_to,
          record.certificate_days_remaining,

          record.proof_payload_hash,
          record.proof_payload_canonical,
          record.signed_at,

          chainIndex,
          blockId,
          blockId,
          1,
          100,
          JSON.stringify(proof as ProofNode[])
        ]
      )

      chainIndex++
    }

    await client.query("COMMIT")

    console.log("✅ Test Merkle block created with A1 signatures")
    console.log({
      block_id: blockId,
      block_hash: blockHash,
      merkle_root: with0x(merkleRoot),
      events: records.map((r) => ({
        event_hash: r.event_hash,
        signature_algorithm: r.signature_algorithm,
        proof_payload_hash: r.proof_payload_hash
      }))
    })

    console.log("")
    console.log("Open:")
    console.log(`http://localhost:3000/explorer/block/${normalizeHash(blockHash)}`)
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("❌ Failed to create test Merkle block:", error)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main()