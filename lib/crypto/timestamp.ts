import crypto from "crypto"

type TimestampResult = {
  timestamp: string
  tsa: string
  hash: string
  proof: string
}

/**
 * Timestamp criptográfico (pré-TSA real)
 */
export async function addTimestamp(
  data: string
): Promise<TimestampResult> {

  const timestamp = new Date().toISOString()

  // 🔐 hash do conteúdo + tempo
  const hash = crypto
    .createHash("sha256")
    .update(data + timestamp)
    .digest("hex")

  // 🔐 assinatura interna (prova mínima)
  const secret = process.env.TSA_SECRET || "dev-secret"

  const proof = crypto
    .createHmac("sha256", secret)
    .update(hash)
    .digest("hex")

  return {
    timestamp,
    tsa: "DOOHPLAY-TSA",
    hash,
    proof
  }
}