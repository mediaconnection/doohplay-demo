// /lib/domain/proof/keyRegistry.ts

type KeyRecord = {
  keyId: string
  publicKey: string
  active: boolean
}

/* =========================
   IN-MEMORY (POC)
========================= */

const keys: KeyRecord[] = [
  {
    keyId: "v1",
    publicKey: process.env.PUBLIC_KEY_V1!,
    active: false
  },
  {
    keyId: "v2",
    publicKey: process.env.PUBLIC_KEY_V2!,
    active: true
  }
]

/* =========================
   GET KEY
========================= */

export function getPublicKeyById(keyId: string): string | null {
  const key = keys.find(k => k.keyId === keyId)
  return key?.publicKey || null
}

/* =========================
   GET ACTIVE KEY
========================= */

export function getActiveKey(): KeyRecord {
  const key = keys.find(k => k.active)
  if (!key) throw new Error("No active key found")
  return key
}