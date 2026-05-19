import * as asn1js from "asn1js";
import * as pkijs from "pkijs";

export async function verifyTimestampToken(
  tokenBase64: string
): Promise<boolean> {
  try {
    const buffer = Buffer.from(tokenBase64, "base64");
    const asn1 = asn1js.fromBER(buffer.buffer);

    if (asn1.offset === -1) return false;

    const tst = new pkijs.TimeStampResp({ schema: asn1.result });

    return !!tst.timeStampToken;
  } catch {
    return false;
  }
}
