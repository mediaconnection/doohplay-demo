type RevocationResult = {
  revoked: boolean
  source?: string
}

/**
 * Placeholder real (OCSP/CRL deve ser integrado)
 */
export async function checkRevocation(
  serial: string
): Promise<RevocationResult> {

  // 🔥 TODO:
  // integrar com:
  // - ITI (ICP-Brasil)
  // - AC emissora (Serasa, Certisign)

  return {
    revoked: false,
    source: "mock"
  }
}