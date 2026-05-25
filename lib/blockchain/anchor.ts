// @ts-nocheck
import { Contract, JsonRpcProvider, Wallet } from "ethers"
import { pool } from "@/lib/db"

const MIN_CONFIRMATIONS = 3
const NETWORK = "polygon"

const ABI = [
  "function roots(bytes32 root) view returns (bool)",
  "function storeRoot(bytes32 root)",
  "function anchorMerkle(bytes32 root)",
  "event RootAnchored(bytes32 indexed root, address indexed sender)",
] as const

type AnchorMethod = "storeRoot" | "anchorMerkle" | "alreadyAnchored"

type AnchorResult =
  | {
      ok: true
      root: string
      tx_hash: string | null
      block_number: number | null
      confirmations: number
      method: AnchorMethod
      already_anchored?: boolean
      db_updated?: number
    }
  | {
      ok: false
      error: string
    }

function getEnv() {
  const polygonRpc = process.env.POLYGON_RPC
  const privateKey = process.env.PRIVATE_KEY ?? process.env.BLOCKCHAIN_PRIVATE_KEY
  const contractAddress = process.env.POLYGON_CONTRACT_ADDRESS ?? process.env.ANCHOR_CONTRACT_ADDRESS

  if (!polygonRpc) throw new Error("POLYGON_RPC not configured")
  if (!privateKey) throw new Error("PRIVATE_KEY not configured")
  if (!contractAddress) throw new Error("POLYGON_CONTRACT_ADDRESS not configured")

  if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
    throw new Error("Invalid PRIVATE_KEY format")
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
    throw new Error("Invalid POLYGON_CONTRACT_ADDRESS format")
  }

  return { polygonRpc, privateKey, contractAddress }
}

function normalizeRoot(root: string) {
  const value = root.trim().toLowerCase().replace(/^0x/, "")
  return `0x${value}`
}

function strip0x(value: string) {
  return value.trim().toLowerCase().replace(/^0x/, "")
}

function isValidBytes32(value: string) {
  return /^0x[a-f0-9]{64}$/i.test(value)
}

function getContract() {
  const env = getEnv()
  const provider = new JsonRpcProvider(env.polygonRpc)
  const wallet = new Wallet(env.privateKey, provider)

  return new Contract(env.contractAddress, ABI, wallet)
}

async function markAlreadyAnchored(root: string): Promise<number> {
  const rootNo0x = strip0x(root)

  const result = await pool.query(
    `
      update public.event_blocks
      set anchored_at = coalesce(anchored_at, now())
      where lower(replace(merkle_root, '0x', '')) = lower($1)
      returning id, merkle_root, anchored_at
    `,
    [rootNo0x]
  )

  console.log("MARK_ALREADY_ANCHORED_RESULT", {
    root,
    rootNo0x,
    rowCount: result.rowCount,
    rows: result.rows,
  })

  await pool.query(
    `
      insert into public.blockchain_anchor (
        merkle_root,
        tx_hash,
        block_number,
        network,
        created_at
      )
      values ($1, null, null, $2, now())
      on conflict do nothing
    `,
    [root, NETWORK]
  )

  return result.rowCount ?? 0
}

async function saveAnchorToDb(input: {
  root: string
  tx_hash: string
  block_number: number | null
  confirmations: number
}): Promise<number> {
  const rootNo0x = strip0x(input.root)

  const update = await pool.query(
    `
      update public.event_blocks
      set
        tx_hash = $1,
        anchored_at = now()
      where lower(replace(merkle_root, '0x', '')) = lower($2)
      returning id, merkle_root, tx_hash, anchored_at
    `,
    [input.tx_hash, rootNo0x]
  )

  console.log("SAVE_ANCHOR_TO_DB_RESULT", {
    root: input.root,
    rootNo0x,
    tx_hash: input.tx_hash,
    rowCount: update.rowCount,
    rows: update.rows,
  })

  await pool.query(
    `
      insert into public.blockchain_anchor (
        merkle_root,
        tx_hash,
        block_number,
        network,
        created_at
      )
      values ($1, $2, $3, $4, now())
      on conflict do nothing
    `,
    [input.root, input.tx_hash, input.block_number, NETWORK]
  )

  return update.rowCount ?? 0
}

export async function anchorMerkleRoot(
  rootInput: string
): Promise<AnchorResult> {
  try {
    const root = normalizeRoot(rootInput)

    if (!isValidBytes32(root)) {
      return {
        ok: false,
        error: "INVALID_MERKLE_ROOT",
      }
    }

    const contract = getContract()
    const alreadyAnchored = await contract.roots(root)

    if (alreadyAnchored === true) {
      const dbUpdated = await markAlreadyAnchored(root)

      return {
        ok: true,
        root,
        tx_hash: null,
        block_number: null,
        confirmations: 0,
        method: "alreadyAnchored",
        already_anchored: true,
        db_updated: dbUpdated,
      }
    }

    let method: "storeRoot" | "anchorMerkle" = "storeRoot"
    let tx: Awaited<ReturnType<Contract["storeRoot"]>>

    try {
      tx = await contract.storeRoot(root)
    } catch {
      tx = await contract.anchorMerkle(root)
      method = "anchorMerkle"
    }

    const receipt = await tx.wait(MIN_CONFIRMATIONS)

    if (!receipt || receipt.status !== 1) {
      return {
        ok: false,
        error: "TX_FAILED",
      }
    }

    const dbUpdated = await saveAnchorToDb({
      root,
      tx_hash: tx.hash,
      block_number: receipt.blockNumber ?? null,
      confirmations: MIN_CONFIRMATIONS,
    })

    return {
      ok: true,
      root,
      tx_hash: tx.hash,
      block_number: receipt.blockNumber ?? null,
      confirmations: MIN_CONFIRMATIONS,
      method,
      db_updated: dbUpdated,
    }
  } catch (error) {
    console.error("ANCHOR_MERKLE_ROOT_ERROR", error)

    return {
      ok: false,
      error: error instanceof Error ? error.message : "ANCHOR_ERROR",
    }
  }
}
