import { buildBlock } from "../ledger/buildBlock"
import { createAnchor } from "../anchor/createAnchor"
import { generateProofCertificate } from "../generateProofCertificate"
import { pool } from "@/lib/db"

interface PipelineResult {
  blocks_created: number
  anchors_created: number
  certificates_created: number
}

async function generateCertificatesForBlock(blockHeight: number) {

  const res = await pool.query(`
    select id
    from impressions
    where block_height = $1
  `, [blockHeight])

  let count = 0

  for (const row of res.rows) {

    try {

      await generateProofCertificate("impression", row.id)

      count++

    } catch (err) {

      console.error("certificate error", row.id)

    }

  }

  return count

}

/**
 * Executa o pipeline criptográfico do DOOHPLAY
 */
export async function runProofPipeline(): Promise<PipelineResult> {

  let blocks = 0
  let anchors = 0
  let certs = 0

  /*
  STEP 1 — criar bloco do ledger
  */

  const block = await buildBlock()

  if (block.created) {

    blocks++

    const blockHeight = block.block.block_height

    /*
    STEP 2 — gerar certificados
    */

    const createdCerts = await generateCertificatesForBlock(blockHeight)

    certs += createdCerts

  }

  /*
  STEP 3 — criar anchor periódico
  */

  const anchor = await createAnchor()

  if (anchor) {
    anchors++
  }

  return {
    blocks_created: blocks,
    anchors_created: anchors,
    certificates_created: certs
  }

}