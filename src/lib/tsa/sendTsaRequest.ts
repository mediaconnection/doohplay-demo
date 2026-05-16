import "dotenv/config";
import { tsaConfig } from "./tsaConfig";

console.log("🧪 TSA_URL em uso:", tsaConfig.url);

export async function sendTsaRequest(
  tsaRequest: Buffer
): Promise<Buffer> {
  // 1️⃣ Validações defensivas
  if (!tsaConfig.url) {
    throw new Error("TSA_URL não configurada no ambiente");
  }

  if (!tsaRequest || tsaRequest.length === 0) {
    throw new Error("TSA request inválido ou vazio");
  }

  // 2️⃣ Timeout explícito (importante!)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000); // 15s

  try {
    const response = await fetch(tsaConfig.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/timestamp-query",
        "Accept": "application/timestamp-reply",
        "Content-Length": tsaRequest.length.toString(),
        "User-Agent": "DOOHPLAY-TSA-Client/1.0",
      },
      body: tsaRequest as unknown as BodyInit,
      signal: controller.signal,
    });

    // 3️⃣ Tratamento de erro HTTP rico
    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(
        `TSA HTTP ${response.status} ${response.statusText} ${errorBody}`
      );
    }

    // 4️⃣ Retorno binário RFC 3161
    const buffer = Buffer.from(await response.arrayBuffer());

    if (buffer.length === 0) {
      throw new Error("Resposta TSA vazia");
    }

    return buffer;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Timeout ao comunicar com a TSA");
    }

    throw new Error(`Falha ao comunicar com a TSA: ${err.message}`);
  } finally {
    clearTimeout(timeout);
  }
}