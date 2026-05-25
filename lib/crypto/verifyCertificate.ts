// @ts-nocheck
import crypto from "crypto"

export function verifyCertificateSignature(
  certificateHash: string,
  signature: string,
  publicKey: string
) {
  try {
    const verify = crypto.createVerify("SHA256")

    verify.update(certificateHash)

    return verify.verify(publicKey, signature, "hex")
  } catch {
    return false
  }
}

export function recomputeCertificateHash(payload: any) {
  const payloadString = JSON.stringify(payload)

  return crypto
    .createHash("sha256")
    .update(payloadString)
    .digest("hex")
}
