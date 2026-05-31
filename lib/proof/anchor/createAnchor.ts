// @ts-nocheck
import crypto from "crypto"
import { pool } from "@/lib/db"

interface AnchorResult {
  anchor_id: string
  merkle_root: string
  ledger_hash: string
  anchor_network: string
  anchor_tx: string | null
  timestamp: string
}

function sha256(data: string) {
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex")
}

/**
 * Obtém o último estado do ledger
 */
async function getLedgerState() {

  const res = await pool.query(`
    select
      event_hash,
      merkle_root,
      block_height
    from event_chain
    order by block_height desc
    limit 1
  `)

  if (res.rowCount === 0) {
    throw new Error("Ledger is empty")
  }

  return res.rows[0]
}

/**
 * Cria o payload que será ancorado
 */
function buildAnchorPayload(
  merkleRoot: string,
  ledgerHash: string
) {

  const payload = JSON.stringify({
    merkle_root: merkleRoot,
    ledger_hash: ledgerHash,
    anchored_at: new Date().toISOString()
  })

  const payloadHash = sha256(payload)

  return {
    payload,
    payloadHash
  }

}

/**
 * Simulação de publicação em rede externa
 * (OpenTimestamps / Bitcoin / Arweave)
 */
async function publishAnchor(
  payloadHash: string
) {
  try {
    const {ethers} = require('ethers')
    const pkRaw = process.env.WALLET_PRIVATE_KEY
    const pk = pkRaw && !pkRaw.startsWith('0x') ? '0x'+pkRaw : pkRaw
    if (!pk) throw new Error('no key')
    const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC || process.env.POLYGON_RPC)
    const wallet = new ethers.Wallet(pk, provider)
    const tx = await wallet.sendTransaction({to: wallet.address, value: ethers.toBigInt(0), data: ethers.hexlify(ethers.toUtf8Bytes(payloadHash))})
    console.log('[anchor] Polygon tx:', tx.hash)
    return { network: 'polygon', tx: tx.hash }
  } catch(e) {
    console.warn('[anchor] Polygon falhou:', e.message, e.code || '')
    return { network: 'internal', tx: payloadHash }
  }

}

/**
 * Cria um anchor criptográfico da rede DOOHPLAY
 */
export async function createAnchor(): Promise<AnchorResult> {

  const ledger = await getLedgerState()

  const { payloadHash } = buildAnchorPayload(
    ledger.merkle_root,
    ledger.event_hash
  )

  const publish = await publishAnchor(ledger.merkle_root)

  const res = await pool.query(`
    insert into anchors (
      merkle_root,
      ledger_hash,
      anchor_network,
      anchor_tx,
      timestamp
    )
    values ($1,$2,$3,$4,now())
    returning *
  `, [
    ledger.merkle_root,
    ledger.event_hash,
    publish.network,
    publish.tx
  ])

  return res.rows[0]

}
