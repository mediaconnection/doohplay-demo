import fs from "fs";
import signer from "node-signpdf";
import { plainAddPlaceholder } from "node-signpdf/dist/helpers";

export function signPdf(pdfBuffer: Buffer) {

  const pfx = fs.readFileSync(
    "src/certificates/certificado.pfx"
  );

  const passphrase = process.env.CERT_PASSWORD;

  // adiciona placeholder de assinatura
  const pdfWithPlaceholder = plainAddPlaceholder({
    pdfBuffer,
    reason: "DOOHPLAY Proof Certificate",
    signatureLength: 1612
  });

  // assina
  const signedPdf = signer.sign(
    pdfWithPlaceholder,
    pfx,
    { passphrase }
  );

  return signedPdf;
}