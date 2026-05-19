import crypto from "crypto";

export function verifyPdfIntegrity(
  pdfBuffer: Buffer,
  expectedHash: string
) {
  const calculatedHash = crypto
    .createHash("sha256")
    .update(pdfBuffer)
    .digest("hex");

  return {
    calculatedHash,
    expectedHash,
    valid: calculatedHash === expectedHash,
  };
}