import { signPdfWithA1 } from "@/services/signatures/signPdfWithA1";

(async () => {
  const result = await signPdfWithA1({
    pdfUrl: "https://SEU_BUCKET/reports/SEU_HASH.pdf",
    baseHash: "SEU_HASH",
    relatedEvidenceId: "UUID_DA_EVIDENCE_DO_PDF",
  });

  console.log("PDF assinado:", result.signedPdfUrl);
})();