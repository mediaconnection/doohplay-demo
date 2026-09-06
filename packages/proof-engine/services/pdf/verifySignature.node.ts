import crypto from "crypto";
import fs from "fs";
import path from "path";

const publicKeyPath = path.resolve(
  process.cwd(),
  "keys/public.pem"
);

const publicKeyPem = fs.readFileSync(publicKeyPath, "utf8");
// Mesmo achado de src/services/pdf/pdfSigner.ts (03/09/2026): passar a
// chave como string PEM crua pra verify.verify() falha neste ambiente --
// pré-parseada uma vez no carregamento do módulo, reaproveitada em toda
// chamada (createPublicKey é determinístico, sem custo real de refazer
// por chamada, mas não há necessidade).
const publicKey = crypto.createPublicKey(publicKeyPem);

export function verifySignature(
  hash: string,
  signature: string
): boolean {
  const verify = crypto.createVerify("RSA-SHA256");
  verify.update(Buffer.from(hash, "hex"));
  verify.end();

  return verify.verify(publicKey, signature, "base64");
}
