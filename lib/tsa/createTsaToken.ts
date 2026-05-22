import { buildTsaRequest } from "./buildTsaRequest";
import { sendTsaRequest } from "./sendTsaRequest";
import { tsaConfig } from "./tsaConfig";

export async function createTsaToken(data: Buffer): Promise<Buffer> {
  if (!tsaConfig.url) {
    // Stub: TSA_URL not configured — return placeholder token
    return Buffer.from("TSA_STUB_NOT_CONFIGURED", "utf8");
  }

  const tsaRequest = buildTsaRequest(data);
  return sendTsaRequest(tsaRequest);
}