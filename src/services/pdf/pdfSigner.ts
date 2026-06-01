import crypto from "crypto";
import fs from "fs";
import path from "path";

/**
 * Assina um hash SHA-256 (hex) usando RSA
 * Retorna assinatura em base64
 */
export function signHash(hash: string): string {
  let privateKey: string | null = null

  // 1. Secret File do Render: /etc/secrets/private.pem
  const secretPath = "/etc/secrets/private.pem"
  if (fs.existsSync(secretPath)) {
    privateKey = fs.readFileSync(secretPath, "utf8")
  }

  // 2. Fallback: keys/private.pem (desenvolvimento local)
  if (!privateKey) {
    const localPath = path.resolve(process.cwd(), "keys/private.pem")
    if (fs.existsSync(localPath)) {
      privateKey = fs.readFileSync(localPath, "utf8")
    }
  }

  // 3. Fallback: PRIVATE_PEM env var
  if (!privateKey) {
    const privRaw = process.env.PRIVATE_PEM?.trim()
    if (privRaw) {
      privateKey = privRaw.startsWith('-----')
        ? privRaw
        : '-----BEGIN PRIVATE KEY-----\n' + privRaw.match(/.{1,64}/g)!.join('\n') + '\n-----END PRIVATE KEY-----\n'
    }
  }

  if (!privateKey) {
    throw new Error("Chave privada não encontrada em /etc/secrets/private.pem, keys/private.pem ou PRIVATE_PEM")
  }

  const sign = crypto.createSign("RSA-SHA256")
  sign.update(Buffer.from(hash, "hex"))
  sign.end()
  return sign.sign(privateKey, "base64")
}
