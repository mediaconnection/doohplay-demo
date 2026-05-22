import fs from "fs";
import path from "path";
import crypto from "crypto";

interface Manifest {
  baseHash: string;
}

/**
 * Recalcula o hash raiz e valida contra manifest.baseHash
 */
export async function verifyRootHash(
  basePath: string,
  manifest: Manifest
) {
  console.log("[2/4] 🔐 Verificando hash raiz...");

  const reportPath = path.join(basePath, "report.json");
  const rootHashPath = path.join(basePath, "root.hash");

  if (!fs.existsSync(reportPath)) {
    throw new Error("report.json não encontrado");
  }

  if (!fs.existsSync(rootHashPath)) {
    throw new Error("root.hash não encontrado");
  }

  // 1️⃣ Lê report.json
  let reportRaw: string;
  try {
    reportRaw = fs.readFileSync(reportPath, "utf-8");
  } catch {
    throw new Error("Falha ao ler report.json");
  }

  // 2️⃣ Valida JSON
  let reportObj: unknown;
  try {
    reportObj = JSON.parse(reportRaw);
  } catch {
    throw new Error("report.json inválido (JSON malformado)");
  }

  // 3️⃣ Canonicalização (JSON determinístico)
  const canonicalJson = JSON.stringify(reportObj);

  // 4️⃣ Recalcula SHA-256
  const calculatedHash = crypto
    .createHash("sha256")
    .update(canonicalJson)
    .digest("hex");

  // 5️⃣ Lê root.hash
  const storedRootHash = fs
    .readFileSync(rootHashPath, "utf-8")
    .trim();

  if (!/^[a-f0-9]{64}$/i.test(storedRootHash)) {
    throw new Error("root.hash inválido (formato incorreto)");
  }

  // 6️⃣ Comparações finais
  if (calculatedHash !== storedRootHash) {
    throw new Error(
      "Hash recalculado NÃO corresponde ao root.hash"
    );
  }

  if (calculatedHash !== manifest.baseHash) {
    throw new Error(
      "Hash recalculado NÃO corresponde ao manifest.baseHash"
    );
  }

  console.log("      ✔ Hash raiz íntegro e consistente");
}