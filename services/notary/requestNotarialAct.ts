// src/services/notary/requestNotarialAct.ts

import crypto from "crypto";
import { createEvidence } from "@/services/evidences/createEvidence";

interface RequestNotarialActParams {
  baseHash: string;
  manifestHash: string;
  manifestUrl: string;
  verifyUrl: string;

  /**
   * Evidence imediatamente anterior
   * (manifesto assinado / LTV)
   */
  relatedEvidenceId: string;

  /**
   * Identificação do cartório ou plataforma
   * ex: "e-notariado", "cartorio24h", "cartorio_x_sp"
   */
  notaryProvider?: string;
}

/**
 * Solicita ATA NOTARIAL DIGITAL
 *
 * ⚖️ Jurídico
 * 🧾 Auditável
 * ⛓ Encadeado
 * 🇧🇷 Compatível com fluxo brasileiro real
 */
export async function requestNotarialAct(
  params: RequestNotarialActParams
) {
  const notaryProvider =
    params.notaryProvider ?? "e-notariado";

  /**
   * Payload técnico-jurídico
   * (enviado ao cartório)
   */
  const notaryRequestPayload = {
    schemaVersion: "1.0",
    type: "ATA_NOTARIAL_DIGITAL",
    platform: "DOOHPLAY",
    environment: process.env.NODE_ENV ?? "development",
    requestedAt: new Date().toISOString(),

    proof: {
      baseHash: params.baseHash,
      manifestHash: params.manifestHash,
      verifyUrl: params.verifyUrl,
      manifestUrl: params.manifestUrl,
    },

    instructions: [
      "Acessar a URL de verificação pública",
      "Verificar correspondência do hash SHA-256",
      "Confirmar integridade do manifesto jurídico",
      "Descrever tecnicamente o procedimento adotado",
      "Emitir Ata Notarial Digital com fé pública",
    ],

    notaryProvider,
  };

  /**
   * Hash criptográfico do PEDIDO NOTARIAL
   * (prova do conteúdo solicitado)
   */
  const notaryRequestHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(notaryRequestPayload))
    .digest("hex");

  /**
   * Evidence do PEDIDO NOTARIAL
   * (ato jurídico, antes da emissão da ata)
   */
  const notaryRequestEvidence = await createEvidence({
    hash: notaryRequestHash,
    type: "notary_request",
    relatedEntityType: "notarial_act",
    relatedEntityId: params.relatedEvidenceId,
    evidenceJsonUrl: undefined, // opcional: pode virar URL pública depois
  });

  return {
    status: "REQUESTED",
    notaryProvider,

    payload: notaryRequestPayload,

    hash: notaryRequestHash,

    nextSteps: [
      "Enviar payload ao cartório escolhido",
      "Aguardar contato do tabelião",
      "Confirmar emissão da Ata Notarial",
      "Anexar ata assinada ao proof-package",
    ],

    evidence: notaryRequestEvidence,
  };
}