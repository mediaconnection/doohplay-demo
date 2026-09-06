// @ts-nocheck
import QRCode from "qrcode"
import { generateProof } from "@proof-engine/proof/generateProof"
import { assinarComA1 } from "@/lib/crypto/assinarComA1"

export async function generateImpressionReceipt(eventHash:string){

 const proof = await generateProof(eventHash)

 const payload = {
  event_hash: proof.event_hash,
  merkle_root: proof.merkle_root,
  day: proof.day
 }

 const signature = await assinarComA1(
  JSON.stringify(payload)
 )

 const verifyUrl =
  `${process.env.PUBLIC_VERIFY_URL}/verify/${eventHash}`

 const qr = await QRCode.toDataURL(verifyUrl)

 return {

  event_hash:eventHash,

  verify_url:verifyUrl,

  qr_code:qr,

  merkle_root:proof.merkle_root,

  merkle_proof:proof.merkle_proof,

  signature

 }
}
