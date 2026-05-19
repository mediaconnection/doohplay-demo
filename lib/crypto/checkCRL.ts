import axios from "axios"
import forge from "node-forge"

export type CRLCheckResult = {
  revoked: boolean
  checked: boolean
  crlUrl: string | null
  reason?: string
}

type ForgeExtensionLike = {
  name?: string
  altNames?: Array<{
    value?: string
  }>
  value?: string
  [key: string]: unknown
}

function normalizeSerial(value: string): string {
  return value.trim().toLowerCase().replace(/^0+/, "")
}

function extractCRLUrl(cert: forge.pki.Certificate): string | null {
  const extensions = Array.isArray(cert.extensions) ? cert.extensions : []

  const ext = extensions.find((item: ForgeExtensionLike) => {
    return item?.name === "cRLDistributionPoints"
  }) as ForgeExtensionLike | undefined

  const fromAltName = ext?.altNames?.find((item) => {
    return typeof item.value === "string" && /^https?:\/\//i.test(item.value)
  })?.value

  if (fromAltName) {
    return fromAltName
  }

  if (typeof ext?.value === "string") {
    const match = ext.value.match(/https?:\/\/[^\s,]+/i)
    return match?.[0] ?? null
  }

  return null
}

function bufferContainsSerial(buffer: Buffer, serialNumber: string): boolean {
  const normalizedSerial = normalizeSerial(serialNumber)

  if (!normalizedSerial) {
    return false
  }

  const hex = buffer.toString("hex").toLowerCase()
  const text = buffer.toString("latin1").toLowerCase()

  return (
    hex.includes(normalizedSerial) ||
    text.includes(normalizedSerial) ||
    text.includes(serialNumber.toLowerCase())
  )
}

export async function checkCRL(
  cert: forge.pki.Certificate
): Promise<CRLCheckResult> {
  const crlUrl = extractCRLUrl(cert)

  if (!crlUrl) {
    return {
      revoked: false,
      checked: false,
      crlUrl: null,
      reason: "CRL_URL_NOT_FOUND"
    }
  }

  try {
    const res = await axios.get<ArrayBuffer>(crlUrl, {
      responseType: "arraybuffer",
      timeout: 8000
    })

    const buffer = Buffer.from(res.data)

    return {
      revoked: bufferContainsSerial(buffer, cert.serialNumber),
      checked: true,
      crlUrl
    }
  } catch (err) {
    console.error("CRL_CHECK_ERROR", err)

    return {
      revoked: false,
      checked: false,
      crlUrl,
      reason: err instanceof Error ? err.message : "CRL_CHECK_FAILED"
    }
  }
}