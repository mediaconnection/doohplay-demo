// @ts-nocheck
export async function verifySignatureBrowser(
  hash: string,
  signatureHex: string,
  publicKeyPem: string
): Promise<boolean> {

  try {
    /* =========================
       PEM → ArrayBuffer
    ========================= */

    const pem = publicKeyPem
      .replace(/-----BEGIN PUBLIC KEY-----/, "")
      .replace(/-----END PUBLIC KEY-----/, "")
      .replace(/\n/g, "")

    const binaryDer = Uint8Array.from(
      atob(pem),
      c => c.charCodeAt(0)
    )

    /* =========================
       IMPORT KEY
    ========================= */

    const key = await crypto.subtle.importKey(
      "spki",
      binaryDer,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256"
      },
      false,
      ["verify"]
    )

    /* =========================
       HEX → ArrayBuffer
    ========================= */

    const signature = Uint8Array.from(
      signatureHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    )

    const data = new TextEncoder().encode(hash)

    /* =========================
       VERIFY
    ========================= */

    return await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      signature,
      data
    )

  } catch (err) {
    console.error("❌ Browser verify failed:", err)
    return false
  }
}
