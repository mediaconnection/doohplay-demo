import crypto from "crypto"

export function verifyCertificate(
  certificateHash: string,
  signature: string,
  publicKey: string
) {

  const verify = crypto.createVerify("SHA256")

  verify.update(certificateHash)

  return verify.verify(publicKey, signature, "hex")
}