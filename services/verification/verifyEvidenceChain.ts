// verifyEvidenceChain.ts
import { verifyPdfIntegrity } from "./verifyPdfIntegrity";
import { verifySignature } from "./verifySignature";
import { verifyTsa } from "./verifyTsa";

export async function verifyEvidenceChain(params: {
  pdfBuffer: Buffer;
  expectedHash: string;
  tsaBuffer?: Buffer;
}) {
  const hashCheck = verifyPdfIntegrity(
    params.pdfBuffer,
    params.expectedHash
  );

  if (!hashCheck.valid) {
    return {
      valid: false,
      reason: "Hash do PDF não confere",
    };
  }

  const signatureCheck = await verifySignature(params.pdfBuffer);

  if (!signatureCheck.valid) {
    return {
      valid: false,
      reason: "Assinatura inválida",
    };
  }

  if (params.tsaBuffer) {
    const tsaCheck = await verifyTsa(
      params.tsaBuffer,
      hashCheck.calculatedHash
    );

    if (!tsaCheck.valid) {
      return {
        valid: false,
        reason: "TSA inválido",
      };
    }

    return {
      valid: true,
      hashCheck,
      signatureCheck,
      tsaCheck,
    };
  }

  return {
    valid: true,
    hashCheck,
    signatureCheck,
  };
}