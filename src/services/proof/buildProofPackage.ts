import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Cria o pacote pericial final do DOOHPLAY
 * de forma determinística e auditável.
 */
export async function buildProofPackage(params: {
  outputDir: string; // ex: ./proof-package

  manifest: any;
  reportJson: any;

  pdfPath: string;
  signedPdfPath: string;
  tsaPath: string;

  otsPath?: string; // opcional
}) {
  const out = params.outputDir;

  /* =====================================================
   * 1️⃣ Cria diretório limpo
   * ===================================================== */
  if (!fs.existsSync(out)) {
    fs.mkdirSync(out, { recursive: true });
  }

  /* =====================================================
   * 2️⃣ Salva manifest.json
   * ===================================================== */
  const manifestPath = path.join(out, "manifest.json");
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(params.manifest, null, 2),
    "utf-8"
  );

  /* =====================================================
   * 3️⃣ Salva report.json (canônico)
   * ===================================================== */
  const reportPath = path.join(out, "report.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify(params.reportJson, null, 2),
    "utf-8"
  );

  /* =====================================================
   * 4️⃣ Copia PDFs e TSA
   * ===================================================== */
  fs.copyFileSync(params.pdfPath, path.join(out, "report.pdf"));
  fs.copyFileSync(
    params.signedPdfPath,
    path.join(out, "report.signed.pdf")
  );
  fs.copyFileSync(params.tsaPath, path.join(out, "tsa.rfc3161"));

  /* =====================================================
   * 5️⃣ Gera root.hash (hash raiz do pacote)
   * ===================================================== */
  const hash = crypto.createHash("sha256");

  const orderedFiles = [
    "manifest.json",
    "report.json",
    "report.pdf",
    "report.signed.pdf",
    "tsa.rfc3161",
  ];

  for (const file of orderedFiles) {
    const buffer = fs.readFileSync(path.join(out, file));
    hash.update(buffer);
  }

  const rootHash = hash.digest("hex");

  fs.writeFileSync(
    path.join(out, "root.hash"),
    rootHash,
    "utf-8"
  );

  /* =====================================================
   * 6️⃣ Copia root.hash.ots (se existir)
   * ===================================================== */
  if (params.otsPath) {
    fs.copyFileSync(
      params.otsPath,
      path.join(out, "root.hash.ots")
    );
  }

  return {
    outputDir: out,
    rootHash,
  };
}