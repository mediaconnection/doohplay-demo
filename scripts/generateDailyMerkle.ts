import "dotenv/config"
import { createClient } from "@supabase/supabase-js"
import { generateMerkleRoot } from "../reports/generateMerkleRoot"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function run() {

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