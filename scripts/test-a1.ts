import "dotenv/config"
import crypto from "crypto"

import {
  signWithA1,
  signHashWithA1,
  verifySignatureWithA1Certificate,
  verifyHashSignatureWithA1Certificate
} from "../lib/crypto/signWithA1"

function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex")
}

function section(title: string) {
  console.log("\n=========================")
  console.log(title)
  console.log("=========================")
}

function main() {
  const content = JSON.stringify(
    {
      event_id: "evt-test-001",
      campaign_id: "cmp-001",
      device_id: "dev-001",
      played_at: new Date().toISOString(),
      proof: "DOOHPLAY enterprise verification test"
    },
    null,
    2
  )

  const hash = sha256Hex(content)

  section("1) ASSINANDO CONTEÚDO BRUTO")

  const signedContent = signWithA1({
    content,
    inputEncoding: "utf8",
    outputEncoding: "base64"
  })

  console.log("✅ Assinatura do conteúdo gerada")
  console.log("🔐 Algorithm:", signedContent.algorithm)
  console.log("🧩 Mode:", signedContent.mode)
  console.log("👤 Subject:", signedContent.certificate.subject)
  console.log("🏛️ Issuer:", signedContent.certificate.issuer)

  const verifiedContent = verifySignatureWithA1Certificate({
    content,
    signature: signedContent.signature,
    contentEncoding: "utf8",
    signatureEncoding: "base64"
  })

  console.log("✅ Verificação do conteúdo:", verifiedContent ? "OK" : "FALHOU")

  section("2) ASSINANDO HASH SHA-256")

  const signedHash = signHashWithA1({
    hash,
    hashEncoding: "hex",
    outputEncoding: "base64"
  })

  const verifiedHash = verifyHashSignatureWithA1Certificate({
    hash,
    hashEncoding: "hex",
    signature: signedHash.signature,
    signatureEncoding: "base64"
  })

  console.log("🧾 Hash:", hash)
  console.log("✅ Verificação do hash:", verifiedHash ? "OK" : "FALHOU")

  section("3) TESTE NEGATIVO")

  const tampered = content.replace("enterprise", "fraud")

  const verifiedTampered = verifySignatureWithA1Certificate({
    content: tampered,
    signature: signedContent.signature,
    contentEncoding: "utf8",
    signatureEncoding: "base64"
  })

  console.log(
    "🛡️ Conteúdo adulterado:",
    verifiedTampered ? "FALHOU" : "OK: detectado"
  )

  const success = verifiedContent && verifiedHash && !verifiedTampered

  if (!success) {
    console.error("\n❌ TESTE FALHOU")
    process.exit(1)
  }

  console.log("\n🎉 Fluxo A1 validado com sucesso")
}

main()