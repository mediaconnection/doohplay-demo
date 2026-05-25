// @ts-nocheck
import { pool } from "@/lib/db"
import { buildProofGraph } from "@/lib/proof/buildProofGraph"

export async function createSettlement(
  impressionId: string,
  amount: number
) {

  const graph = await buildProofGraph(impressionId)

  if (!graph.anchor) {
    throw new Error("Impression not anchored")
  }

  if (!graph.block) {
    throw new Error("Impression not in ledger")
  }

  const proofHash = graph.subject.hash

  const res = await pool.query(`
    insert into settlements (
      campaign_id,
      impression_id,
      amount,
      proof_hash,
      status
    )
    values ($1,$2,$3,$4,'verified')
    returning *
  `, [
    graph.campaign?.id,
    impressionId,
    amount,
    proofHash
  ])

  return res.rows[0]

}
