import crypto from "crypto";
import rfc3161 from "rfc3161";
import { tsaConfig } from "./tsaConfig";

export async function createTsaToken(data: Buffer): Promise<Buffer> {
  // 1️⃣ Gera hash do conteúdo
  const hash = crypto.createHash(tsaConfig.hashAlgorithm).update(data).digest();

  // 2️⃣ Solicita carimbo à TSA
  const tsaResponse = await rfc3161.timestamp({
    url: tsaConfig.url,
    hash,
    hashAlgorithm: tsaConfig.hashAlgorithm,
  });

  if (!tsaResponse) {
    throw new Error("Falha ao obter TSA token");
  }

  const tsaResponseAny = tsaResponse as unknown as { tst?: Buffer }
  return Buffer.from(tsaResponseAny.tst ?? tsaResponse);
}