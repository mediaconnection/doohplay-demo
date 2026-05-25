// @ts-nocheck
import { ethers } from "ethers"

export function signRoot(root: string, privateKey: string) {
  const wallet = new ethers.Wallet(privateKey)
  return wallet.signMessage(root)
}
