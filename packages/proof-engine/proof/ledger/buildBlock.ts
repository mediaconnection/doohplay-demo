/**
 * @deprecated Este pipeline NUNCA foi usado em producao.
 *
 * Investigacao em 2026-08-26 confirmou: builda blocos a partir da tabela
 * `evidence`, alimentada apenas pela rota isolada
 * app/api/protocol/evidence/route.ts, que parou de receber dados em
 * 2026-06-01 (35 linhas na vida toda). O fluxo real de impressoes
 * (lib/adserver/registerImpression.ts) nunca escreveu em `evidence`.
 *
 * O pipeline real de producao e `runProofChainAggregator()` em
 * lib/proof/aggregator/proofChainAggregator.ts, agendado a cada 5 minutos
 * dentro de worker.ts (scheduleAggregatorJob). Esse sim processou
 * eventos reais de `event_chain` e criou blocos/certificacoes/ancoragens
 * de verdade.
 *
 * Mantido sem remocao por decisao explicita — nao usar como referencia
 * nem estender. Ver STATUS_PROJETO.md para o historico completo.
 */
// @ts-nocheck
import crypto from "crypto"
import { pool } from "@/lib/db"
import { buildMerkleTree } from "../merkle/buildMerkleTree"

interface LedgerEvent {
  id: string
  hash: string
}

function sha256(data: string) {
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex")
}

/**
 * Busca eventos ainda não incluídos em bloco
 */
async function getPendingEvents(): Promise<LedgerEvent[]> {

  const res = await pool.query(`
    select id, hash
    from evidence
    where block_height is null
    order by created_at asc
    limit 1000
  `)

  return res.rows
}

/**
 * Obtém o último bloco do ledger
 */
async function getLastBlock() {

  const res = await pool.query(`
    select
      event_hash,
      block_height
    from event_chain
    order by block_height desc
    limit 1
  `)

  if (res.rowCount === 0) {
    return {
      event_hash: null,
      block_height: 0
    }
  }

  return res.rows[0]

}

/**
 * Cria hash do bloco
 */
function buildBlockHash(
  previousHash: string | null,
  merkleRoot: string,
  height: number
) {

  const payload = JSON.stringify({
    previous_hash: previousHash,
    merkle_root: merkleRoot,
    block_height: height,
    created_at: new Date().toISOString()
  })

  return sha256(payload)

}

/**
 * Constrói um novo bloco do ledger
 */
export async function buildBlock() {

  const events = await getPendingEvents()

  if (events.length === 0) {
    return {
      created: false,
      reason: "no pending events"
    }
  }

  const leaves = events.map(e => e.hash)

  const merkle = buildMerkleTree(leaves)

  const lastBlock = await getLastBlock()

  const newHeight = lastBlock.block_height + 1

  const blockHash = buildBlockHash(
    lastBlock.event_hash,
    merkle.root,
    newHeight
  )

  const client = await pool.connect()

  try {

    await client.query("BEGIN")

    const block = await client.query(`
      insert into event_chain (
        event_hash,
        previous_hash,
        merkle_root,
        block_height,
        occurred_at
      )
      values ($1,$2,$3,$4,now())
      returning *
    `, [
      blockHash,
      lastBlock.event_hash,
      merkle.root,
      newHeight
    ])

    await client.query(`
      update evidence
      set block_height = $1
      where id = any($2)
    `, [
      newHeight,
      events.map(e => e.id)
    ])

    await client.query("COMMIT")

    return {
      created: true,
      block: block.rows[0],
      event_count: events.length
    }

  } catch (err) {

    await client.query("ROLLBACK")
    throw err

  } finally {

    client.release()

  }

}
