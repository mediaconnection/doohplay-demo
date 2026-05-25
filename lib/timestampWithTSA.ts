// @ts-nocheck
import axios from "axios";
import crypto from "crypto";

export async function timestampWithTSA(
  pdfBuffer: Buffer
): Promise<{
  timestampToken: Buffer;
  hashedMessage: string;
}> {

  // 1️⃣ Hash do PDF ASSINADO
  const hash = crypto
    .createHash("sha256")
    .update(pdfBuffer)
    .digest();

  // 2️⃣ Request RFC 3161 (DER simplificado)
  const tsaRequest = Buffer.concat([
    Buffer.from("302f0201013021300906052b0e03021a05000414", "hex"),
    hash
  ]);

  // 3️⃣ Envia para TSA
  const response = await axios.post(
    process.env.TSA_URL!,
    tsaRequest,
    {
      headers: {
        "Content-Type": "application/timestamp-query"
      },
      responseType: "arraybuffer"
    }
  );

  return {
    timestampToken: Buffer.from(response.data),
    hashedMessage: hash.toString("hex")
  };
}

