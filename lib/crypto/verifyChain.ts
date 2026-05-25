// @ts-nocheck
import forge from "node-forge"

export function verifyChain(
  cert: forge.pki.Certificate,
  caCertsPem: string[]
) {

  try {
    const caStore = forge.pki.createCaStore(
      caCertsPem.map(pem =>
        forge.pki.certificateFromPem(pem)
      )
    )

    forge.pki.verifyCertificateChain(
      caStore,
      [cert],
      (vfd) => {
        if (vfd !== true) {
          throw new Error("chain invalid")
        }
        return true
      }
    )

    return { valid: true }

  } catch (err) {
    return { valid: false }
  }
}
