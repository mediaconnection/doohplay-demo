// app/api/admin/diagnostico-pfx/route.ts
// Rota de diagnóstico TEMPORÁRIA — só confirma se CERT_PFX_PATH/
// CERT_PFX_PASSWORD estão configuradas em produção e se o arquivo do
// certificado A1 existe no caminho indicado, sem nunca expor senha,
// chave privada ou conteúdo do certificado. Criada pra fechar o item
// "instalar o novo certificado A1" pendente no STATUS_PROJETO.md — bate
// exatamente com o que lib/crypto/signature/adapters/pfxSigner.ts espera
// (readPfxFile). Remover depois de confirmado (não é parte do produto).
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import fs from "fs"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const { searchParams } = req.nextUrl
  const secret = searchParams.get("secret")
  const isNextAuth = !!session?.user
  const isLegacy = secret && secret === process.env.ADMIN_SECRET
  if (!isNextAuth && !isLegacy) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const pfxPath = process.env.CERT_PFX_PATH ?? null
  const hasPassword =
    typeof process.env.CERT_PFX_PASSWORD === "string" &&
    process.env.CERT_PFX_PASSWORD.length > 0

  let fileExists = false
  let fileSizeBytes: number | null = null
  if (pfxPath) {
    try {
      fileExists = fs.existsSync(pfxPath)
      if (fileExists) fileSizeBytes = fs.statSync(pfxPath).size
    } catch {
      fileExists = false
    }
  }

  // Teste de assinatura ponta a ponta -- só roda se path/senha/arquivo
  // já estiverem OK. Nunca devolve a assinatura em si nem a chave
  // privada, só metadados do certificado carregado (subject/validade),
  // pra confirmar que é o certificado A1 novo (emitido 2026-08-25), não
  // o antigo revogado.
  let signatureTest: {
    ok: boolean
    error?: string
    algorithm?: string
    certificate_subject?: string | null
    certificate_valid_to?: string | null
  } = { ok: false }

  if (pfxPath && hasPassword && fileExists) {
    try {
      const { signCanonicalPayloadWithPfx } = await import(
        "@/lib/crypto/signature/adapters/pfxSigner"
      )
      const result = signCanonicalPayloadWithPfx({
        payload: { diagnostic: true, ts: new Date().toISOString() },
        entity_id: "diagnostico-pfx",
        entity_type: "event",
      })

      let certificateSubject: string | null = null
      let certificateValidTo: string | null = null
      if (result.certificate_pem) {
        const { X509Certificate } = await import("crypto")
        const x509 = new X509Certificate(result.certificate_pem)
        certificateSubject = x509.subject
        certificateValidTo = x509.validTo
      }

      signatureTest = {
        ok: true,
        algorithm: result.algorithm,
        certificate_subject: certificateSubject,
        certificate_valid_to: certificateValidTo,
      }
    } catch (err) {
      signatureTest = {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      }
    }
  }

  return NextResponse.json({
    cert_pfx_path_configured: !!pfxPath,
    cert_pfx_path_value: pfxPath,
    cert_pfx_password_configured: hasPassword,
    file_exists_at_path: fileExists,
    file_size_bytes: fileSizeBytes,
    signature_test: signatureTest,
  })
}
