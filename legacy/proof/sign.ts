import crypto from "crypto"

export function signRoot(root: string, privateKey: string) {
  const sign = crypto.createSign("SHA256")
  sign.update(root)
  sign.end()

  return sign.sign(privateKey, "hex")
}