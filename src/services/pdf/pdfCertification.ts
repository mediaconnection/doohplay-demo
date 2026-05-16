import { prisma as db } from "@/lib/prisma";

type StorePdfCertificationInput = {
  pdfHash: string;
  signature: string;
  algorithm: string;
};

export async function storePdfCertification(
  data: StorePdfCertificationInput
) {
  return db.pdfCertification.create({
    data: {
      pdfHash: data.pdfHash,
      signature: data.signature,
      algorithm: data.algorithm,
    },
  });
}

export async function getPdfCertificationByHash(pdfHash: string) {
  return db.pdfCertification.findUnique({
    where: { pdfHash },
  });
}
