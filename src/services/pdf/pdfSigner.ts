import crypto from "crypto";
import fs from "fs";
import path from "path";

/**
 * Assina um hash SHA-256 (hex) usando RSA
 * Retorna assinatura em base64
 */
export function signHash(hash: string): string {
  let privateKey: string | null = null

  // Achado em produção em 03/09/2026 (rota de diagnóstico temporária,
  // ver STATUS_PROJETO.md): /etc/secrets/private.pem existe neste serviço
  // (provavelmente sobra de outra finalidade -- /etc/secrets/ também guarda
  // certificado-a1.pfx) mas NÃO corresponde a keys/public.pem -- a chave
  // pública derivada dele não batia (keysMatch:false), causando valid:false
  // em toda verificação de assinatura. keys/public.pem foi deliberadamente
  // corrigida pra bater com PRIVATE_PEM (commit f699314, 31/05/2026) -- por
  // isso PRIVATE_PEM agora tem prioridade máxima, não mais por último.

  // 1. PRIVATE_PEM env var -- fonte de verdade, corresponde a keys/public.pem
  const privRaw = process.env.PRIVATE_PEM?.trim()
  if (privRaw) {
    privateKey = privRaw.startsWith('-----')
      ? privRaw
      : '-----BEGIN PRIVATE KEY-----\n' + privRaw.match(/.{1,64}/g)!.join('\n') + '\n-----END PRIVATE KEY-----\n'
  }

  // 2. Fallback: keys/private.pem (desenvolvimento local)
  if (!privateKey) {
    const localPath = path.resolve(process.cwd(), "keys/private.pem")
    if (fs.existsSync(localPath)) {
      privateKey = fs.readFileSync(localPath, "utf8")
    }
  }

  // 3. Fallback: Secret File do Render (mantido só por compatibilidade --
  // nunca deve ter precedência sobre PRIVATE_PEM quando os dois existem)
  if (!privateKey) {
    const secretPath = "/etc/secrets/private.pem"
    if (fs.existsSync(secretPath)) {
      privateKey = fs.readFileSync(secretPath, "utf8")
    }
  }

  if (!privateKey) {
    throw new Error("Chave privada não encontrada em PRIVATE_PEM, keys/private.pem ou /etc/secrets/private.pem")
  }

  const sign = crypto.createSign("RSA-SHA256")
  sign.update(Buffer.from(hash, "hex"))
  sign.end()
  return sign.sign(privateKey, "base64")
}
