import { execFile } from "child_process";
import { validateCertChain } from "./validateCertChain";
import { validateRevocation } from "./validateRevocation";

export async function validatePdfSignature(
  pdfPath: string,
  signerCertPath: string,
  issuerCertPath: string
) {
  return new Promise(async (resolve) => {
    execFile("pdfsig", [pdfPath], async (error, stdout) => {
      if (error) {
        return resolve({
          valid: false,
          error: error.message,
        });
      }

      const validSignature =
        stdout.includes("Signature is Valid");

      if (!validSignature) {
        return resolve({
          valid: false,
          error: "Assinatura inválida",
        });
      }

      // 🔐 Cadeia
      const chain = await validateCertChain(
        signerCertPath
      );

      // 🚫 Revogação
      const revocation = await validateRevocation(
        signerCertPath,
        issuerCertPath
      );

      resolve({
        valid:
          validSignature &&
          chain.valid &&
          revocation.valid,

        signer: extract(stdout, "Signer Certificate"),
        authority: extract(stdout, "Certificate Authority"),
        signedAt: extract(stdout, "Signing Time"),

        chain,
        revocation,
      });
    });
  });
}

function extract(text: string, label: string) {
  const line = text
    .split("\n")
    .find((l) => l.includes(label));
  return line?.split(":").slice(1).join(":").trim();
}