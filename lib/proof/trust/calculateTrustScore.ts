import { pool } from "@/lib/db"
import { buildProofGraph } from "../buildProofGraph"

interface TrustScoreResult {

  entity_type: string
  entity_id: string

  score: number

  evidence_score: number
  merkle_score: number
  block_score: number
  anchor_score: number
  certificate_score: number

}

/**
 * Calcula score de confiança criptográfica
 */
export async function calculateTrustScore(
  type: "impression" | "campaign" | "screen",
  id: string
): Promise<TrustScoreResult> {

  const graph = await buildProofGraph(id)

  let evidenceScore = 0
  let merkleScore = 0
  let blockScore = 0
  let anchorScore = 0
  let certificateScore = 0

  /*
  Evidence
  */

  if (graph.evidence && graph.evidence.length > 0) {
    evidenceScore = 25
  }

  /*
  Merkle
  */

  if (graph.merkle?.root) {
    merkleScore = 20
  }

  /*
  Block
  */

  if (graph.block?.block_height) {
    blockScore = 20
  }

  /*
  Anchor
  */

  if (graph.anchor?.tx) {
    anchorScore = 20
  }

  /*
  Certificate
  */

  if (graph.certificate?.certificate_id) {
    certificateScore = 15
  }

  const total =
    evidenceScore +
    merkleScore +
    blockScore +
    anchorScore +
    certificateScore

  /*
  Salvar score
  */

  await pool.query(`
    insert into trust_scores (
      entity_type,
      entity_id,
      score,
      evidence_score,
      merkle_score,
      block_score,
      anchor_score,
      certificate_score
    )
    values ($1,$2,$3,$4,$5,$6,$7,$8)
    on conflict (entity_type, entity_id)
    do update set
      score = excluded.score,
      evidence_score = excluded.evidence_score,
      merkle_score = excluded.merkle_score,
      block_score = excluded.block_score,
      anchor_score = excluded.anchor_score,
      certificate_score = excluded.certificate_score
  `, [
    type,
    id,
    total,
    evidenceScore,
    merkleScore,
    blockScore,
    anchorScore,
    certificateScore
  ])

  return {
    entity_type: type,
    entity_id: id,
    score: total,
    evidence_score: evidenceScore,
    merkle_score: merkleScore,
    block_score: blockScore,
    anchor_score: anchorScore,
    certificate_score: certificateScore
  }

}