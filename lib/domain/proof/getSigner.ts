import { createSign, createPrivateKey } from "crypto"

export type Signer = {
  sign: (data: string) => Promise<string>
  keyId: string
}

export function getSigner(): Signer {
  const privPemRaw =
    process.env["private.pem"] ?? process.env.PRIVATE_PEM ?? ""

  if (!privPemRaw) {
    throw new Error("getSigner: private.pem env var not set")
  }

  const privateKeyPem = privPemRaw.startsWith("-----")
    ? privPemRaw
    : "-----BEGIN PRIVATE KEY-----\n" +
      privPemRaw.match(/.{1,64}/g)!.join("\n") +
      "\n-----END PRIVATE KEY-----\n"

  const keyId = process.env.CERT_PFX_PATH ?? "doohplay-a1"

  return {
    keyId,
    sign: async (data: string): Promise<string> => {
      const privateKey = createPrivateKey(privateKeyPem)
      const signer = createSign("RSA-SHA256")
      signer.update(data)
      signer.end()
      return signer.sign(privateKey, "base64")
    },
  }
}
