// app/api/admin/clients/[code]/route.ts
//
// Edição (PATCH) e exclusão lógica (DELETE) de cliente (studio_clients)
// pelo admin. Ver o comentário do DELETE abaixo.
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { getPool } from "@/lib/db"
import { requireAdminSession } from "../../_lib/requireAdmin"

export const dynamic = "force-dynamic"

async function checkAuth(req: NextRequest) {
  const session = await getServerSession()
  return !!session?.user
}

// PATCH — edita dados de cadastro do cliente (nome, tipo, endereço, cidade,
// telefone, email, CPF/CNPJ). Não existia nenhuma forma de editar esses
// campos depois do cadastro — só o multiplicador de preço (rota /api/clients/[code]/pricing).
export async function PATCH(req: NextRequest, context: any) {
  if (!(await checkAuth(req))) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  const { code } = await context.params
  const upperCode = String(code).toUpperCase()
  const body = await req.json()

  const allowed = ["name", "business_type", "address", "city", "phone", "email", "cpf_cnpj"] as const
  const updates: string[] = []
  const values: any[] = []
  let i = 1
  for (const field of allowed) {
    if (body[field] !== undefined) {
      updates.push(`${field} = $${i}`)
      values.push(body[field] || null)
      i++
    }
  }
  if (updates.length === 0) {
    return Response.json({ error: "Nenhum campo pra atualizar" }, { status: 400 })
  }
  values.push(upperCode)

  const pool = getPool()
  try {
    const result = await pool.query(
      `UPDATE studio_clients SET ${updates.join(", ")} WHERE code = $${i} RETURNING code, name`,
      values
    )
    if (!result.rows[0]) return Response.json({ error: "Cliente não encontrado" }, { status: 404 })
    return Response.json({ ok: true, ...result.rows[0] })
  } catch (err: any) {
    console.error("[admin clients PATCH]", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — EXCLUSÃO LÓGICA desde 11/10/2026 (Documento-Mestre 12.63).
//
// A versão anterior apagava mídia, campanha, playlist, Clube de Telas,
// leads, alertas e assinatura do cliente, e dava COMMIT antes de checar se
// o cliente existia. Não tocava na fundação unificada (creative_assets_v2/
// placements_v2), então a playlist pública do código continuava servindo
// conteúdo de um cliente que não existia mais (foi o que sobrou do LANCH525).
//
// Agora só marca studio_clients.deleted_at + active = false:
//  - login e dashboard já exigem active = true;
//  - a playlist pública responde vazia pra cliente com deleted_at
//    (app/api/client/playlist/[code]/route.ts);
//  - nada é apagado: mídia, campanha, playlist, leads, vínculo com o player
//    e arquivos ficam como estão;
//  - assinatura: não mexe na linha local nem no Asaas. O cancelamento da
//    cobrança continua MANUAL (decisão do fundador, 11/10/2026).
// Só admin logado — ?secret= não vale pra excluir.
export async function DELETE(_req: NextRequest, context: any) {
  const auth = await requireAdminSession("admin/clients DELETE")
  if (auth.denied) return auth.denied

  const { code } = await context.params
  const upperCode = String(code).toUpperCase()
  const pool = getPool()

  try {
    const result = await pool.query(
      `UPDATE studio_clients SET deleted_at = NOW(), active = false
       WHERE code = $1 AND deleted_at IS NULL RETURNING code, name`,
      [upperCode]
    )
    if (!result.rows[0]) {
      return Response.json({ error: "Cliente não encontrado" }, { status: 404 })
    }
    console.log(`[admin/clients DELETE] ${upperCode} ("${result.rows[0].name}") marcado como excluído por ${auth.email}; nada apagado; assinatura não alterada`)
    return Response.json({ ok: true, soft: true })
  } catch (err) {
    console.error("[admin clients DELETE]", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
