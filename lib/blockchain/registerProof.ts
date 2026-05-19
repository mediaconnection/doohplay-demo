import { ethers } from "ethers"

export async function registerProofOnBlockchain(hash: string) {

  const provider = new ethers.JsonRpcProvider(
    process.env.BLOCKCHAIN_RPC
  )

  const wallet = new ethers.Wallet(
    process.env.BLOCKCHAIN_PRIVATE_KEY!,
    provider
  )

  const tx = await wallet.sendTransaction({
    to: wallet.address,
    value: 0,
    data: ethers.hexlify(ethers.toUtf8Bytes(hash))
  })

  await tx.wait()

  return {
    txHash: tx.hash
  }

}