// @ts-nocheck
export async function signWithICPProvider(blockHash: string) {
  const response = await fetch(process.env.ICP_API_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ICP_API_TOKEN}`
    },
    body: JSON.stringify({
      hash: blockHash,
      algorithm: "SHA256",
      type: "PKCS7"
    })
  })

  if (!response.ok) {
    throw new Error("ICP signing failed")
  }

  const data = await response.json()

  return {
    signature: data.signature, // PKCS#7 base64
    certificate: data.certificate,
    timestamp: data.timestamp
  }
}
