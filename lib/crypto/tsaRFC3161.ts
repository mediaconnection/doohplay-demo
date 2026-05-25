// @ts-nocheck
import fetch from "node-fetch"

type TSAResult = {
  token: string // base64
  tsa: string
}

/**
 * Timestamp RFC3161 (real)
 */
export async function timestampRFC3161(
  hashHex: string
): Promise<TSAResult> {

  const tsaUrl = process.env.TSA_URL

  if (!tsaUrl) {
    throw new Error("TSA_URL not configured")
  }

  const response = await fetch(tsaUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/timestamp-query"
    },
    body: Buffer.from(hashHex, "hex")
  })

  const buffer = await response.arrayBuffer()

  return {
    token: Buffer.from(buffer).toString("base64"),
    tsa: tsaUrl
  }
}
