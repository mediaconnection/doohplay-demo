import crypto from "crypto"

export function verifySignature(
  payload: string,
  signature: string,
  publicKey: string
) {

  const verify = crypto.createVerify("SHA256")

  verify.update(payload)

  return verify.verify(publicKey, signature, "hex")

}