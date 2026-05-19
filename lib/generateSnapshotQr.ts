import QRCode from "qrcode";

export async function generateSnapshotQrCode(
  snapshotId: string,
  hash: string
): Promise<string> {

  const verifyUrl =
    `${process.env.NEXT_PUBLIC_BASE_URL}/verificar` +
    `?snapshot_id=${snapshotId}&hash=${hash}`;

  // Gera QR em base64 (PNG)
  const qrCodeBase64 = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "H", // 🔒 alta tolerância
    margin: 2,
    width: 320
  });

  return qrCodeBase64;
}
