// @ts-nocheck
import forge from "node-forge"

/* =========================
   TYPES
========================= */

type LtvInput = {
  pdfBuffer: Buffer
  ocsp?: string
  crl?: string
  certificates?: string[]
  tsa?: string
}

/* =========================
   MAIN
========================= */

export function embedLtv({
  pdfBuffer,
  ocsp,
  crl,
  certificates,
  tsa
}: LtvInput): Buffer {

  try {

    // ⚠️ Simulação controlada de LTV
    // Node não suporta DSS completo (Adobe)
    // então embutimos como metadata auditável

    const metadata = {
      type: "LTV",
      version: "1.0",

      embedded_at: new Date().toISOString(),

      ocsp,
      crl,
      tsa,

      certificates_count: certificates?.length ?? 0
    }

    const marker = Buffer.from(
      "\n%%DOOHPLAY_LTV_START%%\n" +
      JSON.stringify(metadata) +
      "\n%%DOOHPLAY_LTV_END%%\n"
    )

    return Buffer.concat([pdfBuffer, marker])

  } catch (err) {
    console.error("LTV embed error:", err)
    return pdfBuffer
  }
}
