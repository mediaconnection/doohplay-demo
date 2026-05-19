import crypto from "crypto"
import QRCode from "qrcode"

import { pool } from "@/lib/db"
import { buildProofGraph } from "./buildProofGraph"
import type { ProofCertificate } from "@/lib/proof/types/ProofCertificate"

import { signPkcs7 } from "@/lib/crypto/signPkcs7"
import { timestampRFC3161 } from "@/lib/crypto/tsaRFC3161"

export type SubjectType = "impression" | "campaign" | "audience"

type TsaResult = {
  token: string | null
  timestamp: string
  authority: string
}

type Pkcs7Result = {
  signature: string
  certificateSerial: string
  issuer: string
  subject: string
  algorithm: string
  signedAt: string
}

export type GenerateProofResult = {
  certificate: ProofCertificate
  payload: Record<string, unknown>
  meta: {
    certificate_hash: string
    verify_url: string
    qr_code: string | null
    signature: string
    certificate: {
      serial: string
      issuer: string
      subject: string
      algorithm: string
      signed_at: string
    }
    tsa: TsaResult | null
    ltv_ready: boolean
  }
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObject)

  if (value !== null && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObject((value as Record<string, unknown>)[key])
        return acc
      }, {})
  }

  return value
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortObject(value))
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function normalizeBaseUrl(value?: string | null): string {
  const base = value?.trim() || "http://localhost:3000"
  return base.replace(/\/+$/, "")
}

function normalizePkcs7Result(result: unknown): Pkcs7Result {
  const value = result as Partial<Pkcs7Result> & {
    certificate_serial?: string
    signed_at?: string
  }

  return {
    signature: String(value?.signature ?? ""),
    certificateSerial: String(
      value?.certificateSerial ??
        value?.certificate_serial ??
        "UNKNOWN_SERIAL"
    ),
    issuer: String(value?.issuer ?? "UNKNOWN_ISSUER"),
    subject: String(value?.subject ?? "UNKNOWN_SUBJECT"),
    algorithm: String(value?.algorithm ?? "PKCS7"),
    signedAt: String(
      value?.signedAt ?? value?.signed_at ?? new Date().toISOString()
    )
  }
}

function normalizeTsaResult(result: unknown): TsaResult {
  const value = result as Partial<TsaResult> & {
    timestampToken?: string
    time?: string
  }

  return {
    token: value?.token ?? value?.timestampToken ?? null,
    timestamp: String(value?.timestamp ?? value?.time ?? new Date().toISOString()),
    authority: String(value?.authority ?? "LOCAL_TSA")
  }
}

export async function generateProofCertificate(
  subjectType: SubjectType,
  subjectId: string
): Promise<GenerateProofResult> {
  assert(subjectId && typeof subjectId === "string", "INVALID_SUBJECT_ID")

  const graph = await buildProofGraph(subjectId)
  assert(graph?.subject, "INVALID_PROOF_GRAPH")

  const payload = {
    version: "1.2",
    subject_type: subjectType,
    subject_id: subjectId,
    subject: graph.subject,
    merkle: graph.merkle ?? null,
    block: graph.block ?? null,
    anchor: graph.anchor ?? null,
    created_at: new Date().toISOString()
  }

  const payloadString = stableStringify(payload)

  const certificateHash = crypto
    .createHash("sha256")
    .update(payloadString, "utf8")
    .digest("hex")

  assert(/^[a-f0-9]{64}$/i.test(certificateHash), "INVALID_CERTIFICATE_HASH")

  const baseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_BASE_URL)
  const verifyUrl = `${baseUrl}/verify/${certificateHash}`

  let qrCode: string | null = null

  try {
    qrCode = await QRCode.toDataURL(verifyUrl)
  } catch (error) {
    console.warn("PROOF_CERTIFICATE_QR_FAILED", error)
  }

  const pkcs7 = normalizePkcs7Result(await signPkcs7())

  assert(pkcs7.signature, "PKCS7_SIGNING_FAILED")

  let tsa: TsaResult | null = null

  try {
    tsa = normalizeTsaResult(await timestampRFC3161(certificateHash))
  } catch (error) {
    console.warn("PROOF_CERTIFICATE_TSA_FAILED", error)
  }

  let row: ProofCertificate | null = null

  try {
    const res = await pool.query(
      `
      insert into public.proof_certificates (
        type,
        subject_id,
        hash,
        signature,
        verify_url,
        cert_serial,
        cert_issuer,
        tsa_token,
        tsa_timestamp,
        tsa_authority,
        updated_at
      )
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now())
      on conflict (hash) do update set
        signature = excluded.signature,
        verify_url = excluded.verify_url,
        cert_serial = excluded.cert_serial,
        cert_issuer = excluded.cert_issuer,
        tsa_token = excluded.tsa_token,
        tsa_timestamp = excluded.tsa_timestamp,
        tsa_authority = excluded.tsa_authority,
        updated_at = now()
      returning *
      `,
      [
        subjectType,
        subjectId,
        certificateHash,
        pkcs7.signature,
        verifyUrl,
        pkcs7.certificateSerial,
        pkcs7.issuer,
        tsa?.token ?? null,
        tsa?.timestamp ?? null,
        tsa?.authority ?? null
      ]
    )

    row = (res.rows?.[0] as ProofCertificate | undefined) ?? null
  } catch (error) {
    console.error("PROOF_CERTIFICATE_DB_ERROR", error)

    throw new Error(
      error instanceof Error
        ? `PROOF_CERTIFICATE_DB_FAILED: ${error.message}`
        : "PROOF_CERTIFICATE_DB_FAILED"
    )
  }

  assert(row, "PROOF_CERTIFICATE_PERSISTENCE_FAILED")

  return {
    certificate: row,
    payload,
    meta: {
      certificate_hash: certificateHash,
      verify_url: verifyUrl,
      qr_code: qrCode,
      signature: pkcs7.signature,
      certificate: {
        serial: pkcs7.certificateSerial,
        issuer: pkcs7.issuer,
        subject: pkcs7.subject,
        algorithm: pkcs7.algorithm,
        signed_at: pkcs7.signedAt
      },
      tsa,
      ltv_ready: Boolean(tsa?.token)
    }
  }
}