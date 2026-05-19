export async function signPkcs7() {
  return {
    signature: "STUB_SIGNATURE",
    certificateSerial: "DEV",
    issuer: "DOOHPLAY",
    subject: "DEV CERT",
    algorithm: "PKCS7",
    signedAt: new Date().toISOString()
  }
}