import "dotenv/config"
import { createSignedEventRecord } from "../packages/proof-engine/domain/proof/createSignedEventRecord"

function main() {
  const record = createSignedEventRecord({
    eventType: "media_played",
    sourceTable: "player_events",
    sourceId: "evt-001",
    deviceId: "device-01",
    campaignId: "campaign-01",
    payload: {
      media_id: "media-01",
      duration_seconds: 15,
      proof_note: "DOOHPLAY signed event record test",
    },
  })

  console.log("✅ Registro assinado gerado")
  console.log("event_hash:", record.event_hash)
  console.log("payload_hash:", record.payload_hash)
  console.log("previous_event_hash:", record.previous_event_hash)
  console.log("signature_algorithm:", record.signature_algorithm)
  console.log("signature_encoding:", record.signature_encoding)
  console.log("certificate_fingerprint:", record.certificate_fingerprint)
  console.log("proof_payload_hash:", record.proof_payload_hash)
  console.log("signed_at:", record.signed_at)
}

main()