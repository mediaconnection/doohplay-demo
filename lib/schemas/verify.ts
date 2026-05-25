// @ts-nocheck
import { z } from "zod"

/* =========================
   BASE ENUMS
========================= */

export const VerifyStatus = z.enum([
  "VERIFIED",
  "WARNING",
  "FAILED"
])

export const TrustLevel = z.enum(["HIGH", "MEDIUM", "LOW"])
export const RiskLevel = z.enum(["LOW", "MEDIUM", "HIGH"])

export const BlockchainNetwork = z.enum([
  "polygon",
  "ethereum",
  "testnet",
  "unknown"
])

/* =========================
   COMMON
========================= */

const IsoDate = z.string().datetime()

/* =========================
   FAILED
========================= */

export const VerifyFailedSchema = z.object({
  status: z.literal("FAILED"),
  error: z.string()
})

/* =========================
   SUCCESS / WARNING
========================= */

export const VerifySuccessSchema = z.object({
  status: z.enum(["VERIFIED", "WARNING"]),

  trust: TrustLevel,
  score: z.number().min(0).max(100),
  reasons: z.array(z.string()),

  risk: RiskLevel,

  blockchain: z.boolean(),

  /* =========================
     DETAILS
  ========================= */

  details: z.object({
    signature: z.boolean(),
    merkle: z.boolean(),
    chain: z.boolean(),

    cert_chain: z.boolean().optional(),
    revoked: z.boolean().optional()
  }),

  /* =========================
     CERTIFICATE (CRYPTO)
  ========================= */

  certificate: z
    .object({
      issuer: z.string().optional(),
      subject: z.string().optional(),
      serial: z.string().optional(),
      valid: z.boolean().optional()
    })
    .optional(),

  /* =========================
     CERTIFICATE (DB)
  ========================= */

  certificate_record: z
    .object({
      hash: z.string(),
      created_at: IsoDate
    })
    .optional(),

  /* =========================
     TSA
  ========================= */

  tsa: z
    .object({
      timestamp: IsoDate,
      authority: z.string(),
      valid: z.boolean()
    })
    .optional(),

  /* =========================
     BLOCKCHAIN
  ========================= */

  anchor: z
    .object({
      network: BlockchainNetwork,
      tx_hash: z.string(),
      block: z.number(),
      confirmed: z.boolean()
    })
    .optional(),

  /* =========================
     EVENT
  ========================= */

  event: z
    .object({
      hash: z.string().length(64),
      timestamp: IsoDate
    })
    .optional(),

  /* =========================
     VERIFICATION (AUDIT)
  ========================= */

  verification: z
    .object({
      event_exists: z.boolean(),
      certificate_exists: z.boolean(),

      event_hash_valid: z.boolean(),
      merkle_valid: z.boolean(),

      certificate_hash_valid: z.boolean(),
      signature_valid: z.boolean(),

      cert_chain_valid: z.boolean().optional(),
      revoked: z.boolean().optional(),

      integrity: z.boolean()
    })
    .optional(),

  /* =========================
     CHAIN
  ========================= */

  chain: z
    .object({
      valid: z.boolean(),
      depth: z.number(),
      errors: z.array(z.string())
    })
    .optional(),

  /* =========================
     DEBUG
  ========================= */

  debug: z
    .object({
      errors: z.array(z.string()).optional(),
      latency_ms: z.number().optional()
    })
    .optional(),

  /* =========================
     META
  ========================= */

  meta: z
    .object({
      hash: z.string()
    })
    .optional()
})

/* =========================
   UNION
========================= */

export const VerifyResponseSchema = z.union([
  VerifySuccessSchema,
  VerifyFailedSchema
])

/* =========================
   TYPE
========================= */

export type VerifyResponse = z.infer<typeof VerifyResponseSchema>
