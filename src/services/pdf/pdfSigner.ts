import crypto from "crypto";
import fs from "fs";
import path from "path";

/**
 * Assina um hash SHA-256 (hex) usando RSA
 * Retorna assinatura em base64
 */
export function signHash(hash: string): string {
  // Caminho absoluto da chave privada
  const privateKeyPath = path.resolve(
    process.cwd(),
    "keys/private.pem"
  );

  if (!fs.existsSync(privateKeyPath)) {
    throw new Error("Chave privada não encontrada em keys/private.pem");
  }

  const privateKey = fs.readFileSync(privateKeyPath, "utf8");

  const sign = crypto.createSign("RSA-SHA256");

  // ⚠️ Converter hash HEX para bytes reais
  sign.update(Buffer.from(hash, "hex"));
  sign.end();

  return sign.sign(privateKey, "base64");
}
