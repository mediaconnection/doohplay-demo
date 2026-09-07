import "dotenv/config"
import { ethers } from "ethers"

/**
 * Validar variáveis de ambiente
 */

const RPC = process.env.BLOCKCHAIN_RPC
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY

if (!RPC) {
  throw new Error("BLOCKCHAIN_RPC não definido")
}

if (!PRIVATE_KEY) {
  throw new Error("BLOCKCHAIN_PRIVATE_KEY não definido")
}

const provider = new ethers.JsonRpcProvider(RPC)

const wallet = new ethers.Wallet(PRIVATE_KEY, provider)

/**
 * Script principal
 */

async function run() {

  try {
    // Etapa 2, item 3, sub-parte 2 (2026-09-06): reusa o client oficial de
    // service-role em vez de instanciar o próprio. Import dinâmico (não
    // estático, não alias @/lib): garante que "import dotenv/config" já
    // rodou antes de lib/supabaseServer.ts ler process.env, sem depender
    // de sutileza de ordem de hoisting de imports estáticos em ESM/tsx.
    const { supabaseAdmin: supabase } = await import("../lib/supabaseServer")

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