import crypto from "crypto";

export function generatePdfHash(pdfBuffer: Buffer): string {
  return crypto
    .createHash("sha256")
    .update(pdfBuffer)
    .digest("hex");
}
