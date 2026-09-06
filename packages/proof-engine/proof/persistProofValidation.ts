// @ts-nocheck

import crypto from "crypto";
import { createEvidence } from "@/services/evidences/createEvidence";

export async function persistProofValidation(params: {
  baseHash: string;
  validationResult: any;
  relatedEvidenceId: string;
}) {
  // 🔐 Canonicaliza o resultado da validação
  const validationJson = JSON.stringify(
    params.validationResult,
    Object.keys(params.validationResult).sort(),
    2
  );

  const validationHash = crypto
    .createHash("sha256")
    .update(validationJson)
    .digest("hex");

  // 🧾 Evidence auditável (idempotente)
  const validationEvidence = await createEvidence({
    hash: `${params.baseHash}:validation:${validationHash}`,
    type: "proof_validation",
    relatedEntityType: "proof_package",
    relatedEntityId: params.relatedEvidenceId,
    evidenceJsonUrl: undefined, // pode subir depois se quiser
  });

  return {
    validationHash,
    validationEvidence,
    validationJson,
  };
}
