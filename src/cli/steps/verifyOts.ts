import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";

/**
 * Verifica ancoragem OpenTimestamps (Blockchain)
 */
export async function verifyOts(basePath: string) {
  console.log("[4/4] 🔗 Verificando âncora blockchain (OpenTimestamps)...");

  const hashPath = path.join(basePath, "root.hash");
  const otsPath = path.join(basePath, "root.hash.ots");

  if (!fs.existsSync(hashPath)) {
    throw new Error("root.hash não encontrado");
  }

  if (!fs.existsSync(otsPath)) {
    throw new Error("root.hash.ots não encontrado");
  }

  // 1️⃣ Lê arquivos
  const hashBuffer = fs.readFileSync(hashPath);
  const otsBuffer = fs.readFileSync(otsPath);

  if (hashBuffer.length === 0) {
    throw new Error("root.hash está vazio");
  }

  if (otsBuffer.length === 0) {
    throw new Error("root.hash.ots está vazio");
  }

  // 2️⃣ Validação básica de hash
  const computedHash = crypto
    .createHash("sha256")
    .update(hashBuffer)
    .digest("hex");

  const declaredHash = hashBuffer
    .toString("utf-8")
    .trim()
    .toLowerCase();

  if (computedHash !== declaredHash) {
    throw new Error(
      "root.hash NÃO corresponde ao conteúdo esperado"
    );
  }

  // 3️⃣ Verificação oficial via OpenTimestamps CLI
  try {
    execSync(
      `ots verify "${otsPath}"`,
      { stdio: "ignore" }
    );
  } catch {
    throw new Error(
      "Falha na verificação OpenTimestamps (blockchain)"
    );
  }

  console.log("      ✔ Âncora blockchain válida e confirmada");
}