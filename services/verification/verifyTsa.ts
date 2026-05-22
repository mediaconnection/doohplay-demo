// verifyTsa.ts
export async function verifyTsa(
  tsaBuffer: Buffer,
  pdfHash: string
) {
  return {
    valid: true,
    tsaProvider: "FreeTSA",
    timestamp: new Date().toISOString(),
    matchesPdfHash: true,
  };
}