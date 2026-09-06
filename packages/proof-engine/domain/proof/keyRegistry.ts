import { createPublicKey } from "crypto"

export type ActiveKey = {
  keyId: string
  publicKey: string
  algorithm: string
}

export function getActiveKey(): ActiveKey {
  const privPemRaw = process.env["private.pem"] ?? process.env.PRIVATE_PEM ?? ""
  if (!privPemRaw) throw new Error("getActiveKey: private.pem env var not set")
  const privateKeyPem = privPemRaw.startsWith("-----") ? privPemRaw : "-----BEGIN PRIVATE KEY-----\n" + privPemRaw.match(/.{1,64}/g)!.join("\n") + "\n-----END PRIVATE KEY-----\n"
  const publicKey = createPublicKey(privateKeyPem).export({ type: "spki", format: "pem" }).toString()
  return { keyId: process.env.CERT_PFX_PATH ?? "doohplay-a1", publicKey, algorithm: "RSA-SHA256" }
}
