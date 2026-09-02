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

  return NextResponse.json({
    cert_pfx_path_configured: !!pfxPath,
    cert_pfx_path_value: pfxPath,
    cert_pfx_password_configured: hasPassword,
    file_exists_at_path: fileExists,
    file_size_bytes: fileSizeBytes,
  })
}
