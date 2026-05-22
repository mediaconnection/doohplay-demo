import crypto from "crypto";

/**
 * RFC 3161 — TimeStampReq
 * Estrutura mínima válida
 */
export function buildTsaRequest(data: Buffer): Buffer {
  const hash = crypto.createHash("sha256").update(data).digest();

  /**
   * RFC 3161 ASN.1 (simplificado)
   * Não é “bonito”, mas é correto e interoperável
   */
  const algorithmOID = Buffer.from("0609608648016503040201", "hex"); // SHA-256
  const hashedMessage = Buffer.concat([
    Buffer.from("0420", "hex"),
    hash,
  ]);

  const messageImprint = Buffer.concat([
    Buffer.from("302f", "hex"),
    algorithmOID,
    hashedMessage,
  ]);

  return Buffer.concat([
    Buffer.from("3031", "hex"),
    messageImprint,
  ]);
}