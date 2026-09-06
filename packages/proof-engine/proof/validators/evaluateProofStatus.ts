import { validatePdfSignature } from "./validatePdfSignature";
import { validateTsaToken } from "./validateTsaToken";

export async function evaluateProofStatus(params: {
  signedPdfPath?: string;
  signerCertPath?: string;
  issuerCertPath?: string;
  tsaPath?: string;
}) {
  const details: any = {};
  let ok = true;

  if (
    params.signedPdfPath &&
    params.signerCertPath &&
    params.issuerCertPath
  ) {
    details.pdfSignature =
      await validatePdfSignature(
        params.signedPdfPath,
        params.signerCertPath,
        params.issuerCertPath
      );

    if (!details.pdfSignature.valid) ok = false;
  }

  if (params.tsaPath) {
    details.tsa =
      await validateTsaToken(params.tsaPath);

    if (!details.tsa.valid) ok = false;
  }

  return {
    ok,
    level: ok ? "full" : "partial",
    details,
  };
}