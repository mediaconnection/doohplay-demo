#!/usr/bin/env node
import path from "path";
import fs from "fs";

import { verifyManifest } from "./steps/verifyManifest";
import { verifyRootHash } from "./steps/verifyRootHash";
import { verifyTsa } from "./steps/verifyTsa";
import { verifyOts } from "./steps/verifyOts";

async function main() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    console.error("❌ Uso: verify-proof <proof-package>");
    process.exit(1);
  }

  const basePath = path.resolve(process.cwd(), inputPath);

  if (!fs.existsSync(basePath)) {
    throw new Error(`Diretório não encontrado: ${basePath}`);
  }

  if (!fs.statSync(basePath).isDirectory()) {
    throw new Error("O caminho informado não é um diretório");
  }

  // 🔒 Checagem mínima de estrutura
  const requiredFiles = [
    "manifest.json",
    "root.hash",
    "root.hash.ots",
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(basePath, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo obrigatório ausente: ${file}`);
    }
  }

  console.log("🔎 Iniciando verificação do pacote de prova");
  console.log(`📦 Diretório: ${basePath}\n`);

  console.log("[1/4] 📄 Verificando manifesto...");
  const manifest = await verifyManifest(basePath);
  console.log("      ✔ Manifesto válido");

  console.log("[2/4] 🔐 Verificando hash raiz...");
  await verifyRootHash(basePath, manifest);
  console.log("      ✔ Hash raiz íntegro");

  console.log("[3/4] ⏱️ Verificando timestamp (TSA)...");
  await verifyTsa(basePath, manifest);
  console.log("      ✔ Timestamp confiável");

  console.log("[4/4] ⛓️ Verificando âncora OpenTimestamps...");
  await verifyOts(basePath);
  console.log("      ✔ Âncora pública válida");

  console.log("\n✅ PROVA VÁLIDA");
  console.log(`🔐 Hash raiz: ${manifest.baseHash}`);
  console.log("⚖️ Cadeia de integridade preservada");
}

main().catch((err) => {
  console.error("\n❌ PROVA INVÁLIDA");
  console.error(
    err instanceof Error ? err.message : String(err)
  );
  process.exit(2);
});