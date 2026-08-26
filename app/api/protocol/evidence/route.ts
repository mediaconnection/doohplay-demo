/**
 * @deprecated Esta rota alimenta a tabela `evidence`, parte de um pipeline
 * que NUNCA foi usado em producao.
 *
 * Investigacao em 2026-08-26 confirmou: esta e a UNICA rota que escreve em
 * `evidence`, e ela parou de receber chamadas em 2026-06-01 (35 linhas na
 * vida toda). O fluxo real de impressoes (lib/adserver/registerImpression.ts)
 * nunca chamou esta rota nem escreveu em `evidence` diretamente.
 * lib/proof/ledger/buildBlock.ts (que le desta tabela) tambem esta marcado
 * @deprecated pelo mesmo motivo.
 *
 * O pipeline real de producao e `runProofChainAggregator()` em
 * lib/proof/aggregator/proofChainAggregator.ts, agendado a cada 5 minutos
 * dentro de worker.ts.
 *
 * Mantido sem remocao por decisao explicita — nao usar como referencia
 * nem estender. Ver STATUS_PROJETO.md para o historico completo.
 */
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

import crypto from "crypto"

export async function POST(req: Request) {
    const { pool } = await import("@/lib/db")


  const body = await req.json()

  const payload = JSON.stringify(body)

  const hash = crypto
    .createHash("sha256")
    .update(payload)
    .digest("hex")

  const res = await pool.query(`
    insert into evidence (
      type,
      source,
      hash,
      metadata
    )
    values ($1,$2,$3,$4)
    returning *
  `, [
    body.type,
    body.source,
    hash,
    body
  ])

  return Response.json({
    success: true,
    evidence: res.rows[0]
  })

}

