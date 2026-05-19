function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer
}

export async function signPdfWithICP(pdfBytes: Uint8Array): Promise<Uint8Array> {
  const url = process.env.ICP_PDF_API_URL
  const token = process.env.ICP_API_TOKEN

  if (!url) {
    throw new Error("ICP_PDF_API_URL is not configured")
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/pdf",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: toArrayBuffer(pdfBytes)
  })

  if (!response.ok) {
    throw new Error("ICP PDF signing failed")
  }

  const signedPdf = await response.arrayBuffer()

  return new Uint8Array(signedPdf)
}

export default signPdfWithICP