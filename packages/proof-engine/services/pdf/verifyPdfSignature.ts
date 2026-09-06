import crypto from "crypto";
import fs from "fs";
import path from "path";
import { generatePdfHash } from "./pdfHash";

/**
 * Verifica se um PDF é autêntico e não foi alterado
 */
export function verifyPdfSignature(
  pdfBuffer: Buffer,
  signature: string
): boolean {
  if (!Buffer.isBuffer(pdfBuffer)) {
    throw new Error("PDF inválido para verificação");
  }

  // 1️⃣ Recalcular o hash do PDF
  const pdfHash = generatePdfHash(pdfBuffer);

  // 2️⃣ Carregar chave pública
  const publicKey = fs.readFileSync(
    path.resolve(process.cwd(), "keys/public.pem"),
    "utf8"
  );

  // 3️⃣ Verificar assinatura
  const verify = crypto.createVerify("RSA-SHA256");
  verify.update(pdfHash);
  verify.end();

  return verify.verify(publicKey, signature, "base64");
}
