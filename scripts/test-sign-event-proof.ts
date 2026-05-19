import "dotenv/config"
import crypto from "crypto"
import { signEventProof } from "../lib/crypto/signEventProof"
import { verifySignatureWithA1Certificate } from "../lib/crypto/signWithA1"

/* =========================
   HELPERS
========================= */

function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex")
}

function logSection(title: string) {
  console.log("\n=========================")
  console.log(title)
  console.log("=========================")
}

/* =========================
   MAIN
========================= */

function main() {
  const occurredAt = new Date().toISOString()

  const rawEventPayload = {
    event_type: "media_played",
    device_id: "device-01",
    campaign_id: "campaign-01",
    source_table: "player_events",
    source_id: "evt-123",
    occurred_at: occurredAt,
    media_id: "media-01",
    duration_seconds: 15,
    proof_note: "DOOHPLAY enterprise proof test",
  }

  const payloadCanonical = JSON.stringify(rawEventPayload)
  const payloadHash = sha256Hex(payloadCanonical)

  const eventHash = sha256Hex(
    `${payloadHash}|${rawEventPayload.device_id}|${rawEventPayload.occurred_at}`
  )

  logSection("1) ASSINANDO PROVA DE EVENTO")

  const proof = signEventProof({
    eventHash,
    payloadHash,
    deviceId: rawEventPayload.device_id,
    campaignId: rawEventPayload.campaign_id,
    sourceTable: rawEventPayload.source_table,
    sourceId: rawEventPayload.source_id,
    occurredAt: rawEventPayload.occurred_at,
    metadata: {
      media_id: rawEventPayload.media_id,
      duration_seconds: rawEventPayload.duration_seconds,
      note: rawEventPayload.proof_note,
    },
  })

  console.log("✅ Prova assinada com sucesso")
  console.log("🧾 Event hash:", proof.proof_payload.event_hash)
  console.log("🧾 Payload hash:", proof.proof_payload.payload_hash)
  console.log("🧾 Proof payload hash:", proof.proof_payload_hash)
  console.log("🔐 Signature (base64):", proof.signature)
  console.log("👤 Subject:", proof.certificate_subject)
  console.log("🏛️ Issuer:", proof.certificate_issuer)
  console.log("🔐 Fingerprint:", proof.certificate_fingerprint)
  console.log("⏰ Signed at:", proof.signed_at)

  logSection("2) VALIDANDO ASSINATURA DO HASH CANÔNICO")

  const detachedHashHex = proof.proof_payload_hash.replace(/^0x/, "")

  const verifiedHash = verifySignatureWithA1Certificate({
    content: detachedHashHex,
    contentEncoding: "hex",
    signature: proof.signature,
    signatureEncoding: "base64",
  })

  console.log(
    "✅ Verificação do hash assinado:",
    verifiedHash ? "OK" : "FALHOU"
  )

  logSection("3) TESTE DE INTEGRIDADE DO PAYLOAD")

  const recomputedProofPayloadHash = sha256Hex(proof.proof_payload_canonical)

  const sameHash =
    recomputedProofPayloadHash.toLowerCase() === detachedHashHex.toLowerCase()

  console.log("🔁 Hash recalculado:", recomputedProofPayloadHash)
  console.log("🧩 Hash persistido:", detachedHashHex)
  console.log("✅ Integridade do payload:", sameHash ? "OK" : "FALHOU")

  logSection("4) TESTE NEGATIVO (ADULTERAÇÃO)")

  const tamperedCanonical = proof.proof_payload_canonical.replace(
    "media-01",
    "media-99"
  )

  const tamperedHashHex = sha256Hex(tamperedCanonical)

  const verifiedTampered = verifySignatureWithA1Certificate({
    content: tamperedHashHex,
    contentEncoding: "hex",
    signature: proof.signature,
    signatureEncoding: "base64",
  })

  console.log(
    "🛡️ Verificação com hash adulterado:",
    verifiedTampered ? "ERRO: deveria falhar" : "OK: adulteração detectada"
  )

  logSection("5) RESUMO FINAL")

  console.log("Assinatura do proof payload:", verifiedHash ? "OK" : "FALHOU")
  console.log("Integridade do proof payload:", sameHash ? "OK" : "FALHOU")
  console.log("Detecção de adulteração:", !verifiedTampered ? "OK" : "FALHOU")

  if (!verifiedHash || !sameHash || verifiedTampered) {
    console.error("\n❌ TESTE FALHOU")
    process.exit(1)
  }

  console.log("\n🎉 TESTE COMPLETO OK — A1 INTEGRADO COM SUCESSO")
}

main()