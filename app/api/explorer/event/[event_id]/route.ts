import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"

export const dynamic = "force-dynamic"
export const revalidate = 0

/* =========================
   CONFIG
========================= */

const DB_TIMEOUT_MS = 5000
const NETWORK_NAME = "polygon"

/* =========================
   TYPES
========================= */

type ProofStep = {
  hash: string
  position?: "left" | "right"
}

type EventRecord = {
  event_id: string
  event_hash: string
  block_hash: string | null
  merkle_root: string | null
  occurred_at: string | null
  tx_hash: string | null
  merkle_proof: ProofStep[] | null
}

type ExplorerEventResponse = {
  ok: true
  event: EventRecord
  verification: {
    anchored: boolean
    hash_valid: boolean
    merkle_root_valid: boolean
    merkle_proof_valid: boolean
    tx_valid: boolean
  }
  blockchain: {
    network: string
    anchored: boolean
    tx_hash: string | null
  }
  audit: {
    integrity_status: "VERIFIED" | "WARNING" | "FAILED"
    trust_level: "HIGH" | "MEDIUM" | "LOW"
    reasons: string[]
    trust_score: number
  }
}

type ErrorResponse = {
  ok: false
  error: string
  code:
    | "INVALID_EVENT_ID"
    | "EVENT_NOT_FOUND"
    | "DB_TIMEOUT"
    | "INTERNAL_ERROR"
}

/* =========================
   HELPERS
========================= */

function safeString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null
}

function strip0x(v?: string | null): string {
  return String(v ?? "").toLowerCase().replace(/^0x/, "")
}

function add0x(v?: string | null): string {
  const n = strip0x(v)
  return n ? `0x${n}` : ""
}

function isHex64(v?: string | null): boolean {
  return /^[a-f0-9]{64}$/i.test(strip0x(v))
}

function normalizeHash(v?: string | null): string | null {
  if (!v) return null
  const h = add0x(v)
  return isHex64(h) ? h : null
}

function toISO(v: unknown): string | null {
  if (!v) return null
  const d = new Date(String(v))
  return isNaN(d.getTime()) ? null : d.toISOString()
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let t: any
  const timeout = new Promise<T>((_, rej) => {
    t = setTimeout(() => rej(new Error("DB_TIMEOUT")), ms)
  })

  try {
    return await Promise.race([p, timeout])
  } finally {
    clearTimeout(t)
  }
}

/* =========================
   PROOF PARSER
========================= */

function parseProof(raw: any): ProofStep[] | null {
  if (!raw) return null

  let parsed = raw

  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw)
    } catch {
      return null
    }
  }

  if (!Array.isArray(parsed)) return null

  const result: ProofStep[] = []

  for (const item of parsed) {
    if (typeof item === "string") {
      const h = normalizeHash(item)
      if (h) result.push({ hash: h })
      continue
    }

    if (typeof item === "object") {
      const hash =
        normalizeHash(item.hash) ||
        normalizeHash(item.sibling) ||
        normalizeHash(item.value)

      if (!hash) continue

      const pos =
        item.position === "left" || item.position === "right"
          ? item.position
          : undefined

      result.push({ hash, position: pos })
    }
  }

  return result.length ? result : null
}

/* =========================
   FETCH EVENT
========================= */

async function fetchEvent(eventId: string): Promise<EventRecord | null> {
  const sql = `
    select
      event_id,
      event_hash,
      block_hash,
      merkle_root,
      occurred_at,
      blockchain_tx as tx_hash,
      merkle_proof
    from event_chain
    where event_id = $1
    limit 1
  `

  const res = await pool.query(sql, [eventId])
  const row = res.rows[0]

  if (!row) return null

  return {
    event_id: row.event_id,
    event_hash: add0x(row.event_hash),
    block_hash: row.block_hash ? add0x(row.block_hash) : null,
    merkle_root: row.merkle_root ? add0x(row.merkle_root) : null,
    occurred_at: toISO(row.occurred_at),
    tx_hash: row.tx_hash ? add0x(row.tx_hash) : null,
    merkle_proof: parseProof(row.merkle_proof),
  }
}

/* =========================
   VERIFICATION
========================= */

function verify(event: EventRecord) {
  return {
    anchored: !!event.tx_hash,
    hash_valid: isHex64(event.event_hash),
    merkle_root_valid: isHex64(event.merkle_root),
    merkle_proof_valid:
      Array.isArray(event.merkle_proof) &&
      event.merkle_proof.length > 0,
    tx_valid: isHex64(event.tx_hash),
  }
}

/* =========================
   AUDIT ENGINE
========================= */

function buildAudit(event: EventRecord, v: ReturnType<typeof verify>) {
  let score = 0
  const reasons: string[] = []

  if (v.hash_valid) score += 25
  else reasons.push("INVALID_EVENT_HASH")

  if (v.merkle_root_valid) score += 20
  else reasons.push("INVALID_MERKLE_ROOT")

  if (v.merkle_proof_valid) score += 20
  else reasons.push("MISSING_MERKLE_PROOF")

  if (v.anchored) score += 20
  else reasons.push("NOT_ANCHORED")

  if (v.tx_valid) score += 10
  else if (event.tx_hash) reasons.push("INVALID_TX_HASH")

  score = Math.max(0, Math.min(100, score))

  let integrity: "VERIFIED" | "WARNING" | "FAILED" = "FAILED"
  let trust: "HIGH" | "MEDIUM" | "LOW" = "LOW"

  if (score >= 85) {
    integrity = "VERIFIED"
    trust = "HIGH"
  } else if (score >= 60) {
    integrity = "WARNING"
    trust = "MEDIUM"
  }

  return {
    integrity_status: integrity,
    trust_level: trust,
    reasons,
    trust_score: score,
  }
}

/* =========================
   RESPONSE
========================= */

function error(status: number, msg: string, code: ErrorResponse["code"]) {
  return NextResponse.json(
    { ok: false, error: msg, code },
    { status }
  )
}

/* =========================
   ROUTE
========================= */

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ event_id: string }> }
) {
  try {
    const { event_id } = await context.params
    const id = String(event_id ?? "").trim()

    if (!id || id.length < 6) {
      return error(400, "Invalid event id", "INVALID_EVENT_ID")
    }

    const event = await withTimeout(fetchEvent(id), DB_TIMEOUT_MS)

    if (!event) {
      return error(404, "Event not found", "EVENT_NOT_FOUND")
    }

    const verification = verify(event)
    const audit = buildAudit(event, verification)

    return NextResponse.json<ExplorerEventResponse>({
      ok: true,
      event,
      verification,
      blockchain: {
        network: NETWORK_NAME,
        anchored: verification.anchored,
        tx_hash: event.tx_hash,
      },
      audit,
    })
  } catch (err) {
    if (err instanceof Error && err.message === "DB_TIMEOUT") {
      return error(504, "Database timeout", "DB_TIMEOUT")
    }

    console.error(err)

    return error(
      500,
      "Internal server error",
      "INTERNAL_ERROR"
    )
  }
}