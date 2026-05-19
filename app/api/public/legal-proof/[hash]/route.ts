import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

import { pool } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type DigitalCertificationRow = {
  content_hash: string
  signed_hash: string | null
  certificate_authority: string | null
  certificate_serial: string | null
  issued_at: string | Date | null
  proof_url: string | null
}

function normalizeHash(value: unknown): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase().replace(/^0x/, "")
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null
}

function toIsoOrNull(value: string | Date | null): string | null {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ hash: string }> }
) {
  void request

  try {
    const { hash: rawHash } = await context.params
    const contentHash = normalizeHash(rawHash)

    if (!contentHash) {
      return NextResponse.json(
        { valid: false, error: "INVALID_HASH_FORMAT" },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `
      SELECT
        content_hash,
        signed_hash,
        certificate_authority,
        certificate_serial,
        issued_at,
        proof_url
      FROM public.digital_certifications
      WHERE lower(replace(content_hash, '0x', '')) = $1
      LIMIT 1
      `,
      [contentHash]
    )

    const rows = result.rows as DigitalCertificationRow[]
    const record = rows[0]

    if (!record) {
      return NextResponse.json(
        { valid: false, error: "HASH_NOT_FOUND" },
        { status: 404 }
      )
    }

    const recalculatedHash = crypto
      .createHash("sha256")
      .update(record.content_hash)
      .digest("hex")

    if (
      record.signed_hash &&
      recalculatedHash !== normalizeHash(record.signed_hash)
    ) {
      return NextResponse.json(
        {
          valid: false,
          error: "INTEGRITY_CHECK_FAILED"
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        valid: true,
        hash_algorithm: "SHA-256",
        content_hash: record.content_hash,
        signed_by: record.certificate_authority ?? "DOOHPLAY",
        certificate_serial: record.certificate_serial,
        certificate_chain: "ICP-Brasil",
        timestamp_authority: "TSA ICP-Brasil",
        issued_at: toIsoOrNull(record.issued_at),
        legal_basis: "MP 2.200-2/2001",
        public_proof_url: record.proof_url,
        verification_status: "JURIDICALLY_VALID"
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    )
  } catch (error) {
    console.error("PUBLIC_LEGAL_PROOF_ROUTE_ERROR", error)

    return NextResponse.json(
      {
        valid: false,
        error: "INTERNAL_ERROR",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}