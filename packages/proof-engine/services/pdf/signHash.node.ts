import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Assina um hash SHA-256 (hex) usando RSA
 */
export function signHash(hash: string): string {
  const privateKeyPath = path.resolve(
    process.cwd(),
    "keys/private.pem"
  );

  if (!fs.existsSync(privateKeyPath)) {
    throw new Error("Chave privada não encontrada em keys/private.pem");
  }

  const privateKey = fs.readFileSync(privateKeyPath, "utf8");

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(Buffer.from(hash, "hex"));
  sign.end();

  return sign.sign(privateKey, "base64");
}
