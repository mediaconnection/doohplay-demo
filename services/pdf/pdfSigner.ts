import crypto from "crypto"
import fs from "fs"
import path from "path"

/**
 * Assina um hash SHA-256 (hex) usando RSA
 * Retorna assinatura em base64
 */
export function signHash(hash: string): string {
  // Busca a chave privada em /etc/secrets (Render Secret Files) ou keys/ local
  const secretPath = "/etc/secrets/private.pem"
  const localPath = path.resolve(process.cwd(), "keys/private.pem")

  const privateKeyPath = fs.existsSync(secretPath) ? secretPath : localPath

  if (!fs.existsSync(privateKeyPath)) {
    throw new Error(
      "Chave privada não encontrada em /etc/secrets/private.pem nem em keys/private.pem"
    )
  }

  const privateKey = fs.readFileSync(privateKeyPath, "utf8")

  const sign = crypto.createSign("RSA-SHA256")

  // Converter hash HEX para bytes reais
  sign.update(Buffer.from(hash, "hex"))
  sign.end()

  return sign.sign(privateKey, "base64")
}