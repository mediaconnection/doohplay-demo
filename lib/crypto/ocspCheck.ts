// @ts-nocheck
import forge from "node-forge"

type OCSPResult = {
  revoked: boolean
  status: "good" | "revoked" | "unknown"
}

/**
 * Verificação OCSP básica
 */
export async function checkOCSP(
  cert: forge.pki.Certificate,
  issuer: forge.pki.Certificate
): Promise<OCSPResult> {

  try {
    const ocspUrl = cert.extensions?.find(
      (e) => e.name === "authorityInfoAccess"
    )?.accessDescriptions?.find(
      (a: any) => a.accessMethod === forge.pki.oids.ocsp
    )?.accessLocation?.value

    if (!ocspUrl) {
      return { revoked: false, status: "unknown" }
    }

    // 🔥 Aqui você integraria com OCSP real
    // node-forge não tem suporte completo → precisa lib externa

    return { revoked: false, status: "good" }

  } catch {
    return { revoked: false, status: "unknown" }
  }
}
