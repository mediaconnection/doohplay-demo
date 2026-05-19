// lib/validators/hash.ts

export function isValidHash(hash: string) {
  return /^[a-f0-9]{64}$/i.test(hash)
}