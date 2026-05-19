import forge from "node-forge"

/**
 * Valida cadeia até AC Raiz
 */
export function validateCertificateChain(
  cert: forge.pki.Certificate,
  caCerts: forge.pki.Certificate[]
): boolean {
  try {
    const caStore = forge.pki.createCaStore(caCerts)

    forge.pki.verifyCertificateChain(caStore, [cert])

    return true
  } catch {
    return false
  }
}