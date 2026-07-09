// lib/password.ts
// Hash de senha usando scrypt nativo do Node (módulo `crypto`, já embutido
// — sem precisar instalar bcrypt/bcryptjs). Formato salvo: "salt:hash",
// ambos em hex.
import { randomBytes, scryptSync, timingSafeEqual } from "crypto"

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hashHex] = stored.split(":")
  if (!salt || !hashHex) return false
  try {
    const hashBuffer = Buffer.from(hashHex, "hex")
    const suppliedHash = scryptSync(password, salt, 64)
    if (hashBuffer.length !== suppliedHash.length) return false
    return timingSafeEqual(hashBuffer, suppliedHash)
  } catch {
    return false
  }
}
