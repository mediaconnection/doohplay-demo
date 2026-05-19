import { pool } from "@/lib/db"
import { buildProofGraphNetwork } from "./buildProofGraphNetwork"

/**
 * Busca impressões que ainda não possuem node no grafo
 */
async function getPendingImpressions() {

  const res = await pool.query(`
    select i.id
    from impressions i
    left join proof_nodes pn
      on pn.node_type = 'impression'
      and pn.ref_id = i.id
    where pn.node_id is null
    limit 500
  `)

  return res.rows
}

/**
 * Constrói grafos pendentes
 */
export async function autoBuildGraph() {

  const impressions = await getPendingImpressions()

  let built = 0
  let failed = 0

  for (const imp of impressions) {

    try {

      await buildProofGraphNetwork(imp.id)

      built++

    } catch (err) {

      console.error("Graph build error", imp.id)

      failed++

    }

  }

  return {
    processed: impressions.length,
    graphs_created: built,
    failed
  }

}