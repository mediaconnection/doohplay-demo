import { pool } from "@/lib/db"
import { assinarComA1 } from "@/lib/crypto/assinarComA1"

export async function publishTransparencyLog(){

 const root = await pool.query(`
  SELECT merkle_root
  FROM daily_merkle_roots
  ORDER BY day DESC
  LIMIT 1
 `)

 const checkpoint = await pool.query(`
  SELECT checkpoint_hash
  FROM ledger_checkpoints
  ORDER BY checkpoint_time DESC
  LIMIT 1
 `)

 const count = await pool.query(`
  SELECT count(*) as total
  FROM event_chain
 `)

 const payload = {

  merkle_root:root.rows[0]?.merkle_root,

  checkpoint_hash:checkpoint.rows[0]?.checkpoint_hash,

  event_count:count.rows[0]?.total,

  timestamp:new Date().toISOString()

 }

 const signature = await assinarComA1(
  JSON.stringify(payload)
 )

 await pool.query(`
  INSERT INTO transparency_log
  (merkle_root,checkpoint_hash,event_count,signature)
  VALUES ($1,$2,$3,$4)
 `,[
  payload.merkle_root,
  payload.checkpoint_hash,
  payload.event_count,
  signature
 ])

 return {
  ...payload,
  signature
 }
}