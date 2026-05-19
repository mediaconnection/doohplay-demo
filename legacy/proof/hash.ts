import crypto from "crypto"

export function hashProof(data: any): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex")
}