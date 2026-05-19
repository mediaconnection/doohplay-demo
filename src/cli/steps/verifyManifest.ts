import fs from "fs";
import path from "path";

interface ManifestEvidenceRef {
  id: string;
  url: string;
}

interface Manifest {
  version: string;
  baseHash: string;
  period: {
    start: string;
    end: string;
  };
  evidences: {
    report: { id: string };
    pdf: ManifestEvidenceRef;
    signedPdf: ManifestEvidenceRef;
    tsa: ManifestEvidenceRef;
    anchor: ManifestEvidenceRef;
  };
  generatedAt: string;
}

/**
 * Verifica a integridade estrutural e jurídica do manifest.json
 */
export async function verifyManifest(
  basePath: string
): Promise<Manifest> {
  const manifestPath = path.join(basePath, "manifest.json");

  if (!fs.existsSync(manifestPath)) {
    throw new Error("manifest.json não encontrado");
  }

  let manifestRaw: string;
  try {
    manifestRaw = fs.readFileSync(manifestPath, "utf-8");
  } catch {
    throw new Error("Falha ao ler manifest.json");
  }

  let manifest: Manifest;
  try {
    manifest = JSON.parse(manifestRaw);
  } catch {
    throw new Error("manifest.json inválido (JSON malformado)");
  }

  /* =====================================================
   * Validações obrigatórias
   * ===================================================== */

  if (!manifest.version) {
    throw new Error("manifest.version ausente");
  }

  if (!manifest.baseHash || typeof manifest.baseHash !== "string") {
    throw new Error("manifest.baseHash inválido ou ausente");
  }

  if (
    !manifest.period ||
    !manifest.period.start ||
    !manifest.period.end
  ) {
    throw new Error("manifest.period inválido");
  }

  if (!manifest.evidences) {
    throw new Error("manifest.evidences ausente");
  }

  const requiredEvidenceKeys = [
    "report",
    "pdf",
    "signedPdf",
    "tsa",
    "anchor",
  ] as const;

  for (const key of requiredEvidenceKeys) {
    if (!(key in manifest.evidences)) {
      throw new Error(`evidence ausente: ${key}`);
    }
  }

  // Verifica IDs e URLs
  for (const [key, value] of Object.entries(
    manifest.evidences
  )) {
    if (!value || typeof value !== "object") {
      throw new Error(`evidence inválida: ${key}`);
    }

    if (!("id" in value)) {
      throw new Error(`evidence ${key} sem id`);
    }

    if ("url" in value && typeof value.url !== "string") {
      throw new Error(`evidence ${key} com url inválida`);
    }
  }

  // Datas válidas
  if (isNaN(Date.parse(manifest.period.start))) {
    throw new Error("period.start inválido");
  }

  if (isNaN(Date.parse(manifest.period.end))) {
    throw new Error("period.end inválido");
  }

  if (
    manifest.generatedAt &&
    isNaN(Date.parse(manifest.generatedAt))
  ) {
    throw new Error("generatedAt inválido");
  }

  return manifest;
}