import { prisma as db } from "@/lib/prisma";

type StorePdfCertificationInput = {
  pdfHash: string;
  signature: string;
  algorithm: string;
  generatedBy?: string;
  environment?: string;
  publicKeyId?: string;
  ipAddress?: string;
  userAgent?: string;
};

export async function storePdfCertification(
  data: StorePdfCertificationInput
) {
  return db.pdfCertification.create({
    data: {
      pdfHash: data.pdfHash,
      signature: data.signature,
      algorithm: data.algorithm,
      generatedBy: data.generatedBy ?? "system",
      environment: data.environment ?? process.env.NODE_ENV ?? "production",
      publicKeyId: data.publicKeyId ?? "default",
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  });
}

export async function getPdfCertificationByHash(pdfHash: string) {
  return db.pdfCertification.findUnique({
    where: { pdfHash },
  });
}
