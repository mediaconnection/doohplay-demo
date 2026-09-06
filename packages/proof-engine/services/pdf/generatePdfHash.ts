import crypto from "crypto";

/**
 * Gera o hash SHA-256 de um PDF
 * ✔ Entrada: Buffer do PDF FINAL
 * ✔ Saída: string hex (64 caracteres)
 */
export function generatePdfHash(pdfBuffer: Buffer): string {
  if (!Buffer.isBuffer(pdfBuffer)) {
    throw new Error("Entrada inválida: PDF não é um Buffer");
  }

  const hash = crypto
    .createHash("sha256")
    .update(pdfBuffer)
    .digest("hex");

  return hash;
}
