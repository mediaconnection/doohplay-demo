-- CreateTable
CREATE TABLE IF NOT EXISTS "PdfCertification" (
    "id" TEXT NOT NULL,
    "pdfHash" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "certifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedBy" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "publicKeyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PdfCertification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PdfCertification_pdfHash_key" ON "PdfCertification"("pdfHash");
