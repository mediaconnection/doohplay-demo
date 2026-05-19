import { ethers } from "ethers"
import { wallet } from "./polygonClient"
import { pool } from "@/lib/db"

const ABI = [
  "function storeRoot(bytes32 root) external",
  "function anchorMerkle(bytes32 root) external"
]

function normalizeBytes32(value: string): string {
  const clean = value.trim().toLowerCase().replace(/^0x/, "")

  if (!/^[a-f0-9]{64}$/.test(clean)) {
    throw new Error("INVALID_MERKLE_ROOT")
  }

  return `0x${clean}`
}

export async function anchorMerkleRoot(merkleRoot: string, blockId: number) {
  const client = await pool.connect()

  try {
    const root = normalizeBytes32(merkleRoot)
    const contractAddress = process.env.ANCHOR_CONTRACT_ADDRESS

    if (!contractAddress || !ethers.isAddress(contractAddress)) {
      throw new Error("INVALID_ANCHOR_CONTRACT_ADDRESS")
    }

    const contract = new ethers.Contract(contractAddress, ABI, wallet)

    const tx = await contract.storeRoot(root)
    const receipt = await tx.wait()

    const txHash = tx.hash
    const blockNumber = receipt?.blockNumber ?? null

    await client.query("begin")

    await client.query(
      `
      insert into public.blockchain_anchor (
        block_id,
        merkle_root,
        tx_hash,
        network,
        contract_address,
        method,
        block_number,
        status,
        anchored_at
      )
      values ($1, $2, $3, 'polygon', $4, 'storeRoot', $5, 'CONFIRMED', now())
      on conflict (merkle_root, network) do update
      set
        block_id = excluded.block_id,
        tx_hash = excluded.tx_hash,
        contract_address = excluded.contract_address,
        method = excluded.method,
        block_number = excluded.block_number,
        status = excluded.status,
        anchored_at = excluded.anchored_at
      `,
      [blockId, root, txHash, contractAddress, blockNumber]
    )

    await client.query(
      `
      update public.event_blocks
      set
        tx_hash = $1,
        network = 'polygon',
        anchored_at = now()
      where id = $2
      `,
      [txHash, blockId]
    )

    await client.query("commit")

    return {
      success: true,
      tx_hash: txHash,
      block_number: blockNumber,
      merkle_root: root,
      method: "storeRoot"
    }
  } catch (err) {
    await client.query("rollback").catch(() => undefined)

    return {
      success: false,
      error: err instanceof Error ? err.message : "ANCHOR_ERROR"
    }
  } finally {
    client.release()
  }
}