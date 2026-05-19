export type SignatureEnv = {
  a1PfxPath: string | null
  a1PfxPassword: string | null
  tsaUrl: string | null
  signatureMode: "real" | "mock"
}

function getEnv(name: string): string | null {
  const value = process.env[name]?.trim()
  return value && value.length > 0 ? value : null
}

export const signatureEnv: SignatureEnv = {
  a1PfxPath: getEnv("A1_PFX_PATH") ?? getEnv("CERT_A1_PATH") ?? getEnv("CERT_PFX_PATH"),
  a1PfxPassword:
    getEnv("A1_PFX_PASSWORD") ??
    getEnv("CERT_A1_PASSWORD") ??
    getEnv("CERT_PFX_PASSWORD"),
  tsaUrl: getEnv("TSA_URL"),
  signatureMode:
    getEnv("SIGNATURE_MODE") === "real" ||
    getEnv("ICP_SIGNATURE_MODE") === "real"
      ? "real"
      : "mock"
}

export function isRealSignatureEnabled(): boolean {
  return Boolean(
    signatureEnv.signatureMode === "real" &&
      signatureEnv.a1PfxPath &&
      signatureEnv.a1PfxPassword
  )
}