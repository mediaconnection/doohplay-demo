// @ts-nocheck
import axios from "axios"

export async function checkOCSP(
  cert: any,
  issuerCert: any
) {

  try {
    // ⚠️ Placeholder técnico
    // OCSP real exige ASN.1 request

    const ocspUrl = extractOCSPUrl(cert)

    if (!ocspUrl) {
      throw new Error("No OCSP URL")
    }

    // 🔥 Aqui você chamaria um serviço OCSP real
    // ou implementaria ASN1 OCSP request

    const response = await axios.post(ocspUrl, {
      serial: cert.serialNumber
    })

    return {
      revoked: response.data.revoked === true
    }

  } catch (err) {
    throw err
  }
}

/* =========================
   EXTRACT OCSP URL
========================= */

function extractOCSPUrl(cert: any): string | null {
  const ext = cert.extensions?.find(
    (e: any) => e.name === "authorityInfoAccess"
  )

  return ext?.accessDescriptions?.[0]?.accessLocation?.value ?? null
}
