export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"

import { pool } from "@/lib/db"

export const runtime = "nodejs"

type LatestEventRow = {
  event_hash: string | null
}

type InsertedEvent = {
  id: number
  event_id: string
  event_hash: string
  payload_hash: string
  previous_event_hash: string | null
  created_at: string
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function isUuid(value?: string | null): boolean {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function normalizeHash(value?: string | null): string {
  return String(value || "").trim().toLowerCase().replace(/^0x/, "")
}

function isSha256Hash(value?: string | null): boolean {
  return /^[a-f0-9]{64}$/i.test(normalizeHash(value))
}

function normalizePreviousEventHash(value?: string | null): string | null {
  const hash = safeString(value)
  if (!hash) return null
  if (!isSha256Hash(hash)) throw new Error("previous_event_hash inválido")
  return `0x${normalizeHash(hash)}`
}

export async function POST(req: NextRequest) {
    const { createSignedEventRecord } = await import("@/lib/domain/proof/createSignedEventRecord")

  const client = await pool.connect()

  try {
    const body = await req.json().catch(() => null)

    if (!isObject(body)) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 })
    }

    const eventType = safeString(body.event_type)
    const sourceTable = safeString(body.source_table)
    const sourceId = safeString(body.source_id)
    const eventId = safeString(body.event_id) ?? randomUUID()

    if (!eventType || !sourceTable || !sourceId) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes: event_type, source_table, source_id" },
        { status: 400 }
      )
    }

    if (!isUuid(sourceId)) {
      return NextResponse.json(
        { error: "source_id deve ser UUID válido" },
        { status: 400 }
      )
    }

    if (!isUuid(eventId)) {
      return NextResponse.json(
        { error: "event_id deve ser UUID válido" },
        { status: 400 }
      )
    }

    const deviceId = safeString(body.device_id)
    const campaignId = safeString(body.campaign_id)
    const occurredAt = safeString(body.occurred_at) ?? new Date().toISOString()
    const payload = isObject(body.payload) ? body.payload : {}

    await client.query("BEGIN")
    await client.query("SELECT pg_advisory_xact_lock(hashtext('event_chain_create'))")

    const latestRes = await client.query(`
      SELECT event_hash
      FROM public.event_chain
      WHERE event_hash IS NOT NULL
      ORDER BY created_at DESC NULLS LAST, occurred_at DESC NULLS LAST
      LIMIT 1
    `)

    const latestRows = latestRes.rows as LatestEventRow[]

    const previousEventHash =
      normalizePreviousEventHash(safeString(body.previous_event_hash)) ??
      normalizePreviousEventHash(latestRows[0]?.event_hash)

    const record = await createSignedEventRecord({
      eventType,
      sourceTable,
      sourceId,
      deviceId,
      campaignId,
      occurredAt,
      previousEventHash,
      payload
    })

    const insertedRes = await client.query(
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
        signed_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7::timestamptz, $8::jsonb, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20::timestamptz, $21::timestamptz, $22, $23, $24, $25::timestamptz
      )
      RETURNING id, event_id, event_hash, payload_hash, previous_event_hash, created_at
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
        record.signed_at
      ]
    )

    const insertedRows = insertedRes.rows as InsertedEvent[]
    const row = insertedRows[0]

    if (!row) {
      throw new Error("EVENT_INSERT_FAILED")
    }

    await client.query("COMMIT")

    return NextResponse.json(
      {
        success: true,
        id: row.id,
        event_id: row.event_id,
        event_hash: row.event_hash,
        payload_hash: row.payload_hash,
        previous_event_hash: row.previous_event_hash,
        proof_payload_hash: record.proof_payload_hash,
        signature: record.signature,
        signature_algorithm: record.signature_algorithm,
        signature_encoding: record.signature_encoding,
        certificate_fingerprint: record.certificate_fingerprint,
        signed_at: record.signed_at,
        created_at: row.created_at
      },
      { status: 201 }
    )
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined)

    console.error("[EVENT CREATE ERROR]", error)

    return NextResponse.json(
      {
        error: "Erro ao criar evento assinado",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
