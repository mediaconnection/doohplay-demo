const { generateReport } = require("../reports/generateReport");
const { signReport } = require("../reports/signReport");
const { registerEvidence } = require("../reports/registerEvidence")

async function run() {
  try {
    console.log("\n🚀 Iniciando geração da prova DOOH...\n");

    /**
     * 1️⃣ Gerar relatório
     */
    const report = await generateReport({
      campaign: "Coca-Cola Verão",
      player: "Player-002",
      location: "Shopping Curitiba",
      views: 1245,
      period: "01/02/2026 - 07/02/2026"
    });

    if (!report || !report.filePath) {
      throw new Error("Falha ao gerar relatório");
    }

    console.log("📄 Relatório gerado:");
    console.log("Arquivo:", report.filePath);
    console.log("Hash:", report.hash);
    console.log("");

    /**
     * 2️⃣ Assinar PDF
     */
    console.log("🖊 Iniciando assinatura ICP-Brasil...");

    const signedPdf = await signReport(report.filePath);

    if (!signedPdf) {
      throw new Error("Assinatura do PDF falhou");
    }

    console.log("✅ Relatório assinado com sucesso");
    console.log("Arquivo assinado:", signedPdf);
    console.log("");


    console.log("📦 Registrando evidência no banco...")

    await registerEvidence({
      hash: report.hash,
      pdf: report.filePath,
      signedPdf: signedPdf
    })

    console.log("✅ Evidência registrada no Supabase")



    /**
     * 3️⃣ Construir prova final
     */
    const proof = {
      pdf: report.filePath,
      signedPdf: signedPdf,
      hash: report.hash,
      createdAt: new Date().toISOString()
    };

    console.log("🔐 Prova DOOH gerada:");
    console.log(JSON.stringify(proof, null, 2));

    console.log("\n🏁 Processo finalizado com sucesso.\n");

    return proof;

  } catch (error) {
    console.error("\n❌ Erro ao gerar prova DOOH:");
    console.error(error);
    throw error;
  }
}

/**
 * Executa script diretamente
 */
if (require.main === module) {
  run().catch(() => process.exit(1));
}

module.exports = { run };