import crypto from "crypto"
import { pool } from "@/lib/db"

function sha256(data:string){
 return crypto.createHash("sha256").update(data).digest("hex")
}

export async function createCheckpoint(){

 const lastEvent = await pool.query(`
  SELECT chain_index,event_hash
  FROM event_chain
  ORDER BY chain_index DESC
  LIMIT 1
 `)

 if(lastEvent.rows.length === 0)
  throw new Error("no events")

 const event = lastEvent.rows[0]

 const merkle = await pool.query(`
  SELECT merkle_root
  FROM daily_merkle_roots
  ORDER BY day DESC
  LIMIT 1
 `)

 const previous = await pool.query(`
  SELECT checkpoint_hash
  FROM ledger_checkpoints
  ORDER BY checkpoint_time DESC
  LIMIT 1
 `)

 const previousHash = previous.rows[0]?.checkpoint_hash || null

 const payload = JSON.stringify({
  chain_index:event.chain_index,
  event_hash:event.event_hash,
  merkle_root:merkle.rows[0]?.merkle_root,
  previous:previousHash
 })

 const checkpointHash = sha256(payload)

 await pool.query(`
  INSERT INTO ledger_checkpoints
  (
   last_chain_index,
   last_event_hash,
   merkle_root,
   previous_checkpoint_hash,
   checkpoint_hash
  )
  VALUES ($1,$2,$3,$4,$5)
 `,[
  event.chain_index,
  event.event_hash,
  merkle.rows[0]?.merkle_root,
  previousHash,
  checkpointHash
 ])

 return checkpointHash
}