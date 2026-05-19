import { SignPdf } from "@signpdf/signpdf";
import { P12Signer } from "@signpdf/signer-p12";

export async function signPdfWithA1(
  pdfBuffer: Buffer
): Promise<Buffer> {

  if (!process.env.A1_CERT_BASE64 || !process.env.A1_CERT_PASSWORD) {
    throw new Error("A1_CERT_NOT_CONFIGURED");
  }

  const p12Buffer = Buffer.from(
    process.env.A1_CERT_BASE64,
    "base64"
  );

  const signer = new P12Signer(p12Buffer, {
    passphrase: process.env.A1_CERT_PASSWORD
  });

  const signPdf = new SignPdf();

  const signedPdf = signPdf.sign(
    pdfBuffer,
    signer
  );

  return signedPdf;
}
