import "dotenv/config"
import { loadA1CertificateFromEnv } from "../lib/crypto/loadA1Certificate"

function main() {
  try {
    const loaded = loadA1CertificateFromEnv()

    console.log("✅ CERTIFICADO A1 CARREGADO COM SUCESSO")
    console.log("📄 Arquivo:", loaded.resolvedPath)
    console.log("🏛️ Emissor:", loaded.info.issuer)
    console.log("👤 Titular:", loaded.info.subject)
    console.log("🔢 Serial:", loaded.info.serialNumber)
    console.log("🔐 Fingerprint SHA-256:", loaded.info.fingerprintSha256)
    console.log("📆 Válido de:", loaded.info.validFrom)
    console.log("⏳ Válido até:", loaded.info.validTo)
    console.log(
      "🗓️ Dias restantes:",
      loaded.info.daysRemaining ?? "—"
    )
    console.log("🔑 Chave privada encontrada: sim")
    console.log("🔐 Pronto para assinatura ICP-Brasil")
  } catch (error) {
    console.error("❌ ERRO AO LER CERTIFICADO A1")
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

main()