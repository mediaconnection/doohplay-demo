// @ts-nocheck
import { blockchainEnv } from "@/lib/config/env"

export function getBlockchainRpcs(): string[] {
  return [
    blockchainEnv.rpc,
    blockchainEnv.rpcFallback1,
    blockchainEnv.rpcFallback2
  ].filter(Boolean)
}

export function getBlockchainExplorerTxUrl(txHash: string): string {
  const base = blockchainEnv.explorerBaseUrl.replace(/\/+$/, "")
  return `${base}/${txHash}`
}
