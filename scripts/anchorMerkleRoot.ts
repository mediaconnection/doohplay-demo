import "dotenv/config"
import { createClient } from "@supabase/supabase-js"
import { ethers } from "ethers"

/**
 * Validar variáveis de ambiente
 */

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const RPC = process.env.BLOCKCHAIN_RPC
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Supabase env vars não definidas")
}

if (!RPC) {
  throw new Error("BLOCKCHAIN_RPC não definido")
}

if (!PRIVATE_KEY) {
  throw new Error("BLOCKCHAIN_PRIVATE_KEY não definido")
}

/**
 * Clientes
 */

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const provider = new ethers.JsonRpcProvider(RPC)

const wallet = new ethers.Wallet(PRIVATE_KEY, provider)

/**
 * Script principal
 */

async function run() {

  try {

    console.log("Buscando último batch...")

    const { data, error } = await supabase
      .from("evidence_batches")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) {
      throw error
    }

    if (!data?.length) {
      console.log("Nenhum batch encontrado")
      return
    }

    const batch = data[0]

    const root = batch.merkle_root

    console.log("Merkle Root:", root)

    /**
     * Criar transação
     */

    const tx = await wallet.sendTransaction({
      to: wallet.address,
      value: 0,
      data: ethers.hexlify(ethers.toUtf8Bytes(root)),
      gasLimit: 21000
    })

    console.log("TX enviada:", tx.hash)

    /**
     * Esperar confirmação
     */

    const receipt = await provider.waitForTransaction(tx.hash)

    if (!receipt) {
      throw new Error("Transação não confirmada")
    }

    console.log("TX confirmada:", receipt.hash)

    /**
     * Salvar no banco
     */

    const { error: updateError } = await supabase
      .from("evidence_batches")
      .update({
        blockchain_tx: tx.hash,
        anchored_at: new Date().toISOString()
      })
      .eq("id", batch.id)

    if (updateError) {
      throw updateError
    }

    console.log("Batch ancorado na blockchain")

  } catch (err) {

    console.error("Erro ao ancorar batch:")
    console.error(err)

  }

}

run()