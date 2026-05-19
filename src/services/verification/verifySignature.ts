// verifySignature.ts
export async function verifySignature(pdfBuffer: Buffer) {
  // Nesta etapa você pode:
  // - usar OpenSSL via child_process
  // - ou biblioteca especializada (ex: DSS, iText server-side)

  // Placeholder técnico (estrutura correta)
  return {
    valid: true,
    certificateAuthority: "ICP-Brasil",
    certificateHolder: "Empresa XYZ",
    signedAt: new Date().toISOString(),
  };
}