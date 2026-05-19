import crypto from "crypto"

export function generateChainHash(
  hash: string,
  previousHash: string | null
) {

  const base = hash + (previousHash || "")

  return crypto
    .createHash("sha256")
    .update(base)
    .digest("hex")
}