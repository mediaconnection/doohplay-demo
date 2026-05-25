// @ts-nocheck
import QRCode from "qrcode";

export async function generateVerificationQr(hash: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${hash}`;

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("NEXT_PUBLIC_APP_URL não configurada");
  }

  return QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
  });
}
