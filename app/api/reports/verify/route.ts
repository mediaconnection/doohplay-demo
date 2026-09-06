export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0


export async function POST(request: Request) {
    const { generatePdfHash } = await import("@proof-engine/services/pdf/generatePdfHash")
    const { verifySignature } = await import("@proof-engine/services/pdf/verifySignature.node")

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return Response.json(
        { error: "Arquivo PDF não enviado" },
        { status: 400 }
      );
    }

    // 1️⃣ Converter PDF para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // 2️⃣ Recalcular HASH SHA-256
    const pdfHash = generatePdfHash(pdfBuffer);

    // 3️⃣ Buscar certificação registrada
    // A tabela PdfCertification (Prisma) não existe em produção hoje —
    // nenhuma migration real rodou contra o banco (ver STATUS_PROJETO.md,
    // achado de 2026-08-31). O import também precisa estar aqui dentro:
    // "@proof-engine/services/pdf/pdfCertification" importa "@/lib/prisma", e em
    // produção o client Prisma nunca inicializou de verdade ("did not
    // initialize yet"), então o import em si já lança — se ficasse fora
    // do try (como estava antes), nem esse catch nem o genérico abaixo
    // pegavam, e a rota estourava um 500 vazio de infraestrutura antes
    // de qualquer JSON de erro ser montado (confirmado via curl real
    // contra produção). Isolado pra devolver um sinal honesto de
    // "verificação indisponível" (503) em vez de confundir isso com
    // "PDF inválido".
    let certification
    try {
      const { getPdfCertificationByHash } = await import("@proof-engine/services/pdf/pdfCertification")
      certification = await getPdfCertificationByHash(pdfHash);
    } catch (dbError) {
      console.error("Erro ao consultar certificação de PDF (tabela PdfCertification ausente em produção):", dbError);
      return Response.json(
        { valid: false, available: false, reason: "Verificação de PDF indisponível no momento" },
        { status: 503 }
      );
    }

    if (!certification) {
      return Response.json({
        valid: false,
        reason: "PDF não certificado ou hash desconhecido",
      });
    }

    // 4️⃣ Verificar assinatura com chave pública
    const isValid = verifySignature(
      pdfHash,
      certification.signature
    );

    // 5️⃣ Resposta jurídica
    return Response.json({
      valid: isValid,
      algorithm: certification.algorithm,
      certifiedAt: certification.createdAt,
      certificationId: certification.id,
    });
  } catch (error) {
    console.error("Erro na verificação do PDF:", error);

    return Response.json(
      { error: "Erro interno na verificação" },
      { status: 500 }
    );
  }
}


