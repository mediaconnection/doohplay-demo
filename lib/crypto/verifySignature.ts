// @ts-nocheck
import { ethers } from "ethers"

/* =========================
   VERIFY SIGNATURE
========================= */

export function verifySignature(
  root: string,
  signature: string,
  expectedAddress: string
): boolean {
  try {
    const signer = ethers.verifyMessage(root, signature)

    return (
      signer.toLowerCase() === expectedAddress.toLowerCase()
    )
  } catch (err) {
    console.error("SIGNATURE VERIFY ERROR:", err)
    return false
  }
}
