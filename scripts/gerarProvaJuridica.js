const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const { PDFDocument, StandardFonts } = require("pdf-lib");

const { generateMerkleBatch } =
  require("../lib/merkleService");

// ===== PATHS =====
const ROOT = path.join(__dirname, "..");

const LOG_DIR = path.join(ROOT, "logs");
const REPORT_DIR = path.join(ROOT, "reports");

const LOG_FILE = path.join(LOG_DIR, "assinaturas.log");
const JSON_OUT = path.join(LOG_DIR, "prova-pericial.json");
const PDF_OUT = path.join(REPORT_DIR, "prova-juridica.pdf");

async function main() {

  // ===== GARANTIR PASTAS =====
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  // ===== VALIDAR LOG =====
  if (!fs.existsSync(LOG_FILE)) {
    console.error("❌ Log de assinaturas não encontrado:", LOG_FILE);
    process.exit(1);
  }

  // ===== LER LOG =====
  const linhas = fs
    .readFileSync(LOG_FILE, "utf8")
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const registros = [];

  for (const linha of linhas) {

    const partes = linha.split("|").map(p => p.trim());

    if (partes.length < 3) continue;

    const data = partes[0];
    const nome = partes[1];
    const hashRaw = partes.slice(2).join("|");

    const hash = hashRaw.replace("SHA256=", "").trim();

    if (!/^[a-f0-9]{64}$/i.test(hash)) continue;

    registros.push({
      timestamp: data,
      arquivo: nome,
      sha256: hash
    });

  }

  if (registros.length === 0) {
    console.error("❌ Nenhum registro válido encontrado.");
    process.exit(1);
  }

  // ===== ORDENAR HASHES (DETERMINÍSTICO) =====
  registros.sort((a, b) =>
    a.sha256.localeCompare(b.sha256)
  );

  // ===== GERAR MERKLE TREE =====
  let merkle;

  try {
    merkle = generateMerkleBatch(registros);
  } catch (err) {
    console.error("❌ Erro ao gerar Merkle Tree:", err);
    process.exit(1);
  }

  const merkleRoot = merkle.merkle_root;

  // ===== OBJETO PERICIAL =====
  const prova = {
    sistema: "DOOHPLAY",
    tipo: "Assinatura Digital em Lote",
    algoritmo_hash: "SHA-256",
    merkle_root: merkleRoot,
    data_geracao: new Date().toISOString(),
    total_documentos: registros.length,
    documentos: registros,
    merkle_proofs: merkle.proofs
  };

  // ===== SALVAR JSON =====
  fs.writeFileSync(
    JSON_OUT,
    JSON.stringify(prova, null, 2),
    "utf8"
  );

  // ===== GERAR PDF =====
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  let page = pdf.addPage([595, 842]);
  let y = page.getHeight() - 50;

  const write = (text, size = 10) => {

    page.drawText(String(text), {
      x: 50,
      y,
      size,
      font,
      maxWidth: 500
    });

    y -= size + 6;

    if (y < 60) {
      page = pdf.addPage([595, 842]);
      y = page.getHeight() - 50;
    }
  };

  // ===== CABEÇALHO =====
  write("RELATÓRIO DE PROVA CRIPTOGRÁFICA – DOOHPLAY", 14);
  write("Sistema: DOOHPLAY");
  write(`Data de geração: ${new Date().toLocaleString("pt-BR")}`);
  write(`Algoritmo de hash: SHA-256`);
  write(`Total de documentos: ${registros.length}`);
  write("");

  // ===== DOCUMENTOS =====
  registros.forEach((doc, i) => {

    write(`Documento ${i + 1}`);
    write(`Arquivo: ${doc.arquivo}`);
    write(`Data/Hora: ${doc.timestamp}`);
    write(`SHA-256: ${doc.sha256}`);
    write("");

  });

  // ===== MERKLE ROOT =====
  write("MERKLE ROOT DO LOTE:", 12);
  write(merkleRoot);
  write("");

  // ===== DECLARAÇÃO =====
  write("DECLARAÇÃO TÉCNICA", 12);
  write(
    "Este relatório utiliza Merkle Tree para garantir a integridade criptográfica dos documentos."
  );
  write(
    "Cada documento possui um Merkle Proof que permite verificar matematicamente sua inclusão no lote."
  );
  write(
    "Esta técnica é amplamente utilizada em blockchains e auditoria digital."
  );

  // ===== QR CODE =====
  const verifyUrl =
    `https://verify.doohplay.com/verify/${merkleRoot}`;

  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 300,
    margin: 2,
    errorCorrectionLevel: "H"
  });

  const parts = qrDataUrl.split(",");

  if (parts.length !== 2) {
    throw new Error("Erro ao gerar QR Code");
  }

  const qrImage =
    await pdf.embedPng(Buffer.from(parts[1], "base64"));

  const lastPage =
    pdf.getPages()[pdf.getPageCount() - 1];

  lastPage.drawImage(qrImage, {
    x: lastPage.getWidth() - 150,
    y: 70,
    width: 100,
    height: 100
  });

  lastPage.drawText("Verificação pública:", {
    x: lastPage.getWidth() - 150,
    y: 180,
    size: 8,
    font
  });

  lastPage.drawText(
    merkleRoot.substring(0, 32) + "...",
    {
      x: lastPage.getWidth() - 150,
      y: 165,
      size: 7,
      font
    }
  );

  const bytes = await pdf.save();

  fs.writeFileSync(PDF_OUT, bytes);

  console.log("✅ Prova criptográfica gerada");
  console.log("📄 PDF:", PDF_OUT);
  console.log("🧾 JSON:", JSON_OUT);
  console.log("🌳 Merkle Root:", merkleRoot);
  console.log("🔎 Verificação:", verifyUrl);
}

main();