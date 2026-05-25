// @ts-nocheck
import crypto from "crypto"

export function hashReport(data: any): string {
  const json = JSON.stringify(data)
  return crypto.createHash("sha256").update(json).digest("hex")
}

export function signReport(hash: string): string {
  const privateKey = process.env.PRIVATE_KEY!

  const sign = crypto.createSign("SHA256")
  sign.update(hash)
  sign.end()

  return sign.sign(privateKey, "hex")
}
