import fetch from "node-fetch"
import { verifyPkcs7Signature } from "@/lib/crypto/signPkcs7"
import { pool } from "@/lib/db"

type AuditResult = {
  step: string
  ok: boolean
  details?: any
}

export async function auditSystem(hash: string) {
  const results: AuditResult[] = []

  /* =========================
     1. DB CHECK
  ========================= */

  const certRes = await pool.query(
    `SELECT * FROM proof_certificates WHERE hash = $1 LIMIT 1`,
    [hash]
  )

  const cert = certRes.rows[0]

  results.push({
    step: "DB certificate",
    ok: !!cert
  })

  if (!cert) return results

  /* =========================
     2. PKCS7 SIGNATURE
  ========================= */

  const sigValid = verifyPkcs7Signature(
    cert.signature,
    cert.hash
  )

  results.push({
    step: "PKCS7 signature",
    ok: sigValid
  })

  /* =========================
     3. VERIFY API
  ========================= */

  let verifyData: any = null

  try {
    const res = await fetch(
      `http://localhost:3000/api/verify/${hash}`
    )

    verifyData = await res.json()

    results.push({
      step: "Verify API",
      ok: res.ok
    })

  } catch (err) {
    results.push({
      step: "Verify API",
      ok: false,
      details: err
    })
  }

  /* =========================
     4. INTEGRITY CHECK
  ========================= */

  results.push({
    step: "Integrity",
    ok: verifyData?.verification?.integrity === true
  })

  /* =========================
     5. SIGNATURE FULL
  ========================= */

  results.push({
    step: "Signature valid",
    ok: verifyData?.verification?.signature_valid === true
  })

  /* =========================
     6. CERT CHAIN
  ========================= */

  results.push({
    step: "Certificate chain",
    ok: verifyData?.verification?.cert_chain_valid === true
  })

  /* =========================
     7. REVOCATION
  ========================= */

  results.push({
    step: "Not revoked",
    ok: verifyData?.verification?.revoked === false
  })

  /* =========================
     8. MERKLE
  ========================= */

  results.push({
    step: "Merkle proof",
    ok: verifyData?.verification?.merkle_valid === true
  })

  /* =========================
     9. BLOCKCHAIN
  ========================= */

  results.push({
    step: "Blockchain anchor",
    ok: verifyData?.blockchain === true
  })

  /* =========================
     10. SCORE
  ========================= */

  results.push({
    step: "High trust score",
    ok: verifyData?.trust === "HIGH"
  })

  return results
}