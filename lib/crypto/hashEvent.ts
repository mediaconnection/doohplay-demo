// lib/crypto/hashEvent.ts

import crypto from "crypto"

export function hashEvent(event:any){

  const canonical = JSON.stringify(event)

  return crypto
    .createHash("sha256")
    .update(canonical)
    .digest("hex")
}