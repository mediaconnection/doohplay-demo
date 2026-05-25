// @ts-nocheck
// /lib/domain/risk/schema.ts

import { z } from "zod"

/* =========================
   HELPERS
========================= */

const safeNumber = z.coerce
  .number()
  .refine((v) => Number.isFinite(v), {
    message: "Must be a finite number"
  })

const normalizedProbability = (field: string) =>
  safeNumber
    .min(0, `${field} must be >= 0`)
    .max(1, `${field} must be <= 1`)
    .transform((v) => Number(v.toFixed(6)))

/* =========================
   SCHEMA
========================= */

export const RiskSchema = z
  .object({
    score: safeNumber
      .min(0, "score must be >= 0")
      .max(100, "score must be <= 100"),

    fraudProbability: normalizedProbability("fraudProbability"),

    anomalyLevel: normalizedProbability("anomalyLevel"),

    invalidTrafficRate: normalizedProbability("invalidTrafficRate"),

    chargebackRate: normalizedProbability("chargebackRate")
  })
  .strict()
  .transform((data) => ({
    ...data,
    riskLevel:
      data.score < 30 || data.fraudProbability > 0.8
        ? "critical"
        : "normal"
  }))

/* =========================
   TYPE FINAL
========================= */

export type RiskInput = z.infer<typeof RiskSchema>
