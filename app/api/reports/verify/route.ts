export const dynamic = 'force-dynamic';
import { generatePdfHash } from "@/services/pdf/generatePdfHash";
import { verifySignature } from "@/services/pdf/verifySignature.node";
import { getPdfCertificationByHash } from "@/services/pdf/pdfCertification";

export async function POST(request: Request) {
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
    const certification = await getPdfCertificationByHash(pdfHash);

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

