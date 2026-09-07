import "dotenv/config"
import { generateMerkleRoot } from "../reports/generateMerkleRoot"

async function run() {
  // Etapa 2, item 3, sub-parte 2 (2026-09-06): reusa o client oficial de
  // service-role em vez de instanciar o próprio. Import dinâmico, mesmo
  // motivo de anchorMerkleRoot.ts (evita depender de ordem de hoisting de
  // imports estáticos em ESM/tsx).
  const { supabaseAdmin: supabase } = await import("../lib/supabaseServer")

  const today = new Date()
  today.setHours(0,0,0,0)

  const { data, error } = await supabase
    .from("evidences")
    .select("hash")
    .limit(1000)

  if (error) {
    console.error("Erro ao buscar evidências:", error)
    return
  }

  const hashes = data?.map(e => e.hash) || []

  if (hashes.length === 0) {
    console.log("Nenhuma evidência hoje")
    return
  }

  const root = generateMerkleRoot(hashes)

  console.log("Merkle Root do dia:")
  console.log(root)

}

run()