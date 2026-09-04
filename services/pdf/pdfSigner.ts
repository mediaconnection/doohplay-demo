import crypto from "crypto"
import fs from "fs"
import path from "path"

/**
 * Assina um hash SHA-256 (hex) usando RSA
 * Retorna assinatura em base64
 */
export function signHash(hash: string): string {
  // Achado em 03/09/2026 (STATUS_PROJETO.md): esta é uma cópia duplicada de
  // src/services/pdf/pdfSigner.ts, inalcançável via o alias @/services/pdf/...
  // (resolve pra src/services/pdf/ conforme next.config.ts) -- mas mantida
  // sincronizada com a mesma lógica por segurança, pra eliminar qualquer
  // ambiguidade sobre qual cópia está de fato em uso. Versão antiga aqui
  // nem verificava PRIVATE_PEM, só /etc/secrets/private.pem e
  // keys/private.pem -- e passava a chave como string PEM crua pro sign()
  // (produz assinatura que não verifica corretamente neste ambiente,
  // achado mais fundo desta mesma investigação).
  let privateKey: string | null = null

  const privRaw = process.env.PRIVATE_PEM?.trim()
  if (privRaw) {
    privateKey = privRaw.startsWith('-----')
      ? privRaw
      : '-----BEGIN PRIVATE KEY-----\n' + privRaw.match(/.{1,64}/g)!.join('\n') + '\n-----END PRIVATE KEY-----\n'
  }

  if (!privateKey) {
    const localPath = path.resolve(process.cwd(), "keys/private.pem")
    if (fs.existsSync(localPath)) {
      privateKey = fs.readFileSync(localPath, "utf8")
    }
  }

  if (!privateKey) {
    const secretPath = "/etc/secrets/private.pem"
    if (fs.existsSync(secretPath)) {
      privateKey = fs.readFileSync(secretPath, "utf8")
    }
  }

  if (!privateKey) {
    throw new Error("Chave privada não encontrada em PRIVATE_PEM, keys/private.pem ou /etc/secrets/private.pem")
  }

  const privateKeyObj = crypto.createPrivateKey(privateKey)
  const sign = crypto.createSign("RSA-SHA256")

  // Converter hash HEX para bytes reais
  sign.update(Buffer.from(hash, "hex"))
  sign.end()

  return sign.sign(privateKeyObj, "base64")
}