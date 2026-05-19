import React from "react"
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer
} from "@react-pdf/renderer"

import { pool } from "@/lib/db"
import { verifyEventChain } from "@/lib/domain/ledger/verifyChain"
import { buildMerkleProof } from "@/lib/domain/proof/merkleProof"
import {
  verifyMerkleProof,
  type MerkleProofItem
} from "@/lib/proof/merkle/verifyMerkleProof"
import { verifyBlockHash } from "@/lib/domain/proof/verifyBlock"
import { verifySignature } from "@/lib/domain/proof/signature"
import { calculateTrustScore, getTrustLabel } from "@/lib/domain/trustScore"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type EventRow = {
  event_hash: string
  prev_hash: string | null
  block_id: number | string | null
  merkle_root: string | null
  block_hash: string | null
  prev_block_hash: string | null
  signature: string | null
  tx_hash: string | null
  network: string | null
}

type BlockEventRow = {
  event_hash: string | null
}

type ChainCheck = {
  valid?: boolean
  [key: string]: unknown
}

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 12, fontWeight: "bold" },
  section: { marginBottom: 10 },
  label: { fontSize: 10, fontWeight: "bold", marginBottom: 2 },
  mono: { fontSize: 8, fontFamily: "Courier" },
  row: { marginBottom: 4 }
})

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

function toArrayBuffer(bytes: Uint8Array | ArrayBuffer): ArrayBuffer {
  if (bytes instanceof ArrayBuffer) return bytes

  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer
}

function bool(value: unknown): boolean {
  return value === true
}

function getMerkleProofHash(item: MerkleProofItem): string {
  if (typeof item === "string") return item
  return item.hash ?? ""
}

function getMerkleProofPosition(item: MerkleProofItem): string {
  if (typeof item === "string") return "right"
  return item.position ?? "right"
}

function resolveMerkleValid(result: ReturnType<typeof verifyMerkleProof>): boolean {
  return typeof result === "boolean" ? result : result.valid === true
}

function createPdfDocument(params: {
  event: EventRow
  proof: MerkleProofItem[]
  chainValid: boolean
  merkleValid: boolean
  blockValid: boolean
  signatureValid: boolean
  anchored: boolean
  trustScore: number
  trustLabel: string
}) {
  const {
    event,
    proof,
    chainValid,
    merkleValid,
    blockValid,
    signatureValid,
    anchored,
    trustScore,
    trustLabel
  } = params

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        Text,
        { style: styles.title },
        "DOOHPLAY Audit Certificate"
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.label }, "Event Hash"),
        React.createElement(Text, { style: styles.mono }, event.event_hash)
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.label }, "Merkle Root"),
        React.createElement(Text, { style: styles.mono }, event.merkle_root ?? "N/A")
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.label }, "Block Hash"),
        React.createElement(Text, { style: styles.mono }, event.block_hash ?? "N/A")
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.label }, "Previous Block Hash"),
        React.createElement(Text, { style: styles.mono }, event.prev_block_hash ?? "N/A")
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.label }, "Blockchain TX"),
        React.createElement(Text, { style: styles.mono }, event.tx_hash ?? "N/A")
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.label }, "Network"),
        React.createElement(Text, null, event.network ?? "N/A")
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.label }, "Trust Score"),
        React.createElement(Text, null, `${trustScore} (${trustLabel})`)
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.label }, "Verification"),
        React.createElement(Text, { style: styles.row }, `Chain: ${String(chainValid)}`),
        React.createElement(Text, { style: styles.row }, `Merkle: ${String(merkleValid)}`),
        React.createElement(Text, { style: styles.row }, `Block: ${String(blockValid)}`),
        React.createElement(Text, { style: styles.row }, `Signature: ${String(signatureValid)}`),
        React.createElement(Text, { style: styles.row }, `Anchored: ${String(anchored)}`)
      ),

      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.label }, "Merkle Proof"),
        proof.length === 0
          ? React.createElement(Text, { style: styles.mono }, "N/A")
          : proof.map((item, index) =>
              React.createElement(
                Text,
                { key: `proof-${index}`, style: styles.mono },
                `[${getMerkleProofPosition(item)}] ${getMerkleProofHash(item)}`
              )
            )
      )
    )
  )
}

export async function GET(
  req: Request,
  context: { params: Promise<{ hash: string }> }
) {
  void req

  try {
    const { hash: rawHash } = await context.params
    const hash = safeString(rawHash)

    if (!hash) {
      return new Response("Invalid hash", { status: 400 })
    }

    const normalizedHash = normalizeHash(hash) ?? hash

    const eventRes = await pool.query(
      `
      SELECT
        e.event_hash,
        e.previous_event_hash AS prev_hash,
        e.block_id,
        b.merkle_root,
        b.block_hash,
        b.prev_block_hash,
        b.signature,
        b.tx_hash,
        b.network
      FROM public.event_chain e
      LEFT JOIN public.event_blocks b ON e.block_id = b.id
      WHERE lower(replace(e.event_hash, '0x', '')) = lower(replace($1, '0x', ''))
      LIMIT 1
      `,
      [normalizedHash]
    )

    const eventRows = eventRes.rows as EventRow[]
    const event = eventRows[0]

    if (!event) {
      return new Response("Not found", { status: 404 })
    }

    const eventHash = normalizeHash(event.event_hash)

    if (!eventHash) {
      return new Response("Invalid event hash", { status: 500 })
    }

    let proof: MerkleProofItem[] = []
    let merkleValid = false

    const merkleRoot = normalizeHash(event.merkle_root)

    if (event.block_id && merkleRoot) {
      const blockRes = await pool.query(
        `
        SELECT event_hash
        FROM public.event_chain
        WHERE block_id = $1
          AND event_hash IS NOT NULL
        ORDER BY created_at ASC NULLS LAST, event_id ASC
        `,
        [event.block_id]
      )

      const blockRows = blockRes.rows as BlockEventRow[]

      const hashes = blockRows
        .map((row) => normalizeHash(row.event_hash))
        .filter((value): value is string => Boolean(value))

      const generatedProof = buildMerkleProof(hashes, eventHash)

      proof = Array.isArray(generatedProof)
        ? (generatedProof as MerkleProofItem[])
        : []

      merkleValid = resolveMerkleValid(
        verifyMerkleProof({
          leaf: eventHash,
          proof,
          root: merkleRoot
        })
      )
    }

    const chainCheck = (await verifyEventChain(eventHash)) as ChainCheck

    const prevBlockHash = normalizeHash(event.prev_block_hash)
    const blockHash = normalizeHash(event.block_hash)

    const blockValid =
      prevBlockHash !== null &&
      merkleRoot !== null &&
      blockHash !== null &&
      verifyBlockHash(prevBlockHash, merkleRoot, blockHash)

    const signature = safeString(event.signature)

    const signatureValid =
      signature && blockHash ? verifySignature(blockHash, signature) : true

    const anchored = Boolean(safeString(event.tx_hash))

    const trustScore = calculateTrustScore({
      chain_valid: bool(chainCheck?.valid),
      merkle_valid: merkleValid,
      block_valid: blockValid,
      signature_valid: Boolean(signatureValid),
      anchored
    })

    const trustLabel = getTrustLabel(trustScore)

    const pdfBuffer = await renderToBuffer(
      createPdfDocument({
        event,
        proof,
        chainValid: bool(chainCheck?.valid),
        merkleValid,
        blockValid,
        signatureValid: Boolean(signatureValid),
        anchored,
        trustScore,
        trustLabel
      }) as Parameters<typeof renderToBuffer>[0]
    )

    return new Response(toArrayBuffer(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="event-${eventHash}.pdf"`,
        "Cache-Control": "no-store"
      }
    })
  } catch (error) {
    console.error("EVENT_AUDIT_CERTIFICATE_ERROR", error)

    return new Response("Error", { status: 500 })
  }
}