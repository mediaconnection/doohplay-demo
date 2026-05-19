import { timestampPdfWithTSA } from "@/services/signatures/timestampPdfWithTSA";
import "dotenv/config";

(async () => {
  const result = await timestampPdfWithTSA({
    signedPdfUrl:
      "https://mdlbajgnntjwhycouzit.supabase.co/storage/v1/object/public/reports/b2ee491ac0b91af9f9e826e6675292ee316532b1d7e8103282a0f4566bcb75da.pdf",

    baseHash: "b2ee491ac0b91af9f9e826e6675292ee316532b1d7e8103282a0f4566bcb75da",

    relatedEvidenceId: "UUID_DA_EVIDENCE_ASSINADA"
  });

  console.log("✅ TSA aplicado com sucesso");
  console.log(result);
})();