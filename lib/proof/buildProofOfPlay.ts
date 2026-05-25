// @ts-nocheck
import { pool } from "@/lib/db"
import { generateProof } from "./generateProof"
import { assinarComA1 } from "@/lib/crypto/assinarComA1"

export async function buildProofOfPlay(eventHash:string){

 const eventRes = await pool.query(`
  SELECT *
  FROM event_chain
  WHERE event_hash=$1
 `,[eventHash])

 if(eventRes.rows.length===0)
  throw new Error("event not found")

 const event = eventRes.rows[0]

 const merkle = await generateProof(eventHash)

 const proof = {

  event_hash:eventHash,

  screen_id:event.payload?.screen_id,

  campaign_id:event.payload?.campaign_id,

  played_at:event.created_at,

  merkle_root:merkle.merkle_root,

  merkle_proof:merkle.merkle_proof

 }

 const signature = await assinarComA1(
  JSON.stringify(proof)
 )

 return {
  ...proof,
  signature
 }
}
