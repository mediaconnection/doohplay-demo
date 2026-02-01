import { db } from "@/lib/db";

/**
 * Salva a certificação do PDF
 */
export async function storePdfCertification(data: {
  pdfHash: string;
  signature: string;
  algorithm: string;
}) {
  return db.pdf_signatures.create({
    data: {
      pdf_hash: data.pdfHash,
      signature: data.signature,
      algorithm: data.algorithm,
    },
  });
}

/**
 * Busca a certificação mais recente (para TESTE)
 * ⚠️ depois você pode buscar por reportId, hash, etc
 */
export async function getPdfCertification() {
  return db.pdf_signatures.findFirst({
    orderBy: {
      created_at: "desc",
    },
  });
}
