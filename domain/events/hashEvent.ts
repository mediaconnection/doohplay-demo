import crypto from "crypto"

export function gerarHashEvento(event: unknown) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(event))
    .digest("hex")
}
