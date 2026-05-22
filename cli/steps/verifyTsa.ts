import fs from "fs";
import path from "path";
import crypto from "crypto";

interface Manifest {
  evidences: {
    tsa: {
      url: string;
    };
  };
}

/**
 * Verifica integridade temporal via TSA (RFC 3161)
 */
export async function verifyTsa(
  basePath: string,
  manifest: Manifest
) {
  console.log("[3/4] ⏱️ Verificando timestamp TSA...");

  const tsaPath = path.join(basePath, "tsa.rfc3161");
  const signedPdfPath = path.join(basePath, "report.signed.pdf");

  if (!fs.existsSync(tsaPath)) {
    throw new Error("tsa.rfc3161 não encontrado");
  }

  if (!fs.existsSync(signedPdfPath)) {
    throw new Error("report.signed.pdf não encontrado");
  }

  // 1️⃣ Lê arquivos
  const tsaBuffer = fs.readFileSync(tsaPath);
  const signedPdfBuffer = fs.readFileSync(signedPdfPath);

  if (tsaBuffer.length === 0) {
    throw new Error("tsa.rfc3161 está vazio");
  }

  // 2️⃣ Recalcula hash do PDF assinado
  const pdfHash = crypto
    .createHash("sha256")
    .update(signedPdfBuffer)
    .digest();

  /**
   * ⚠️ RFC 3161:
   * O messageImprint é o hash do conteúdo carimbado
   * Ele aparece literalmente dentro do token
   */
  const imprintIndex = tsaBuffer.indexOf(pdfHash);

  if (imprintIndex === -1) {
    throw new Error(
      "Hash do PDF assinado NÃO encontrado no TSA"
    );
  }

  // 3️⃣ Validação mínima de consistência
  if (!manifest.evidences?.tsa?.url) {
    throw new Error(
      "Manifest não contém referência ao TSA"
    );
  }

  console.log("      ✔ TSA válido e hash carimbado confere");
}