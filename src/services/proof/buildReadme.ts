export function buildReadme(params: {
  baseHash: string;
  verificationUrl: string;
}) {
  return `
PACOTE PROBATÓRIO — DOOHPLAY

Hash base do documento:
${params.baseHash}

Verificação pública:
${params.verificationUrl}

Conteúdo:
- report.pdf → documento original
- report.signed.pdf → PDF assinado digitalmente
- report.tsa.rfc3161 → carimbo de tempo RFC 3161
- hashes.json → hashes SHA-256 de todos os arquivos
- manifest.json → metadados técnicos

Instruções:
1. Calcule o SHA-256 dos arquivos
2. Compare com hashes.json
3. Verifique assinatura PKCS#7
4. Verifique TSA RFC 3161

Este pacote é autossuficiente e pode ser auditado
independentemente da plataforma DOOHPLAY.
`.trim();
}