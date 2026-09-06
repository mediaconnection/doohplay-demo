// @ts-nocheck
import type { LayerName } from "./types"

/* =========================
   TYPES
========================= */

export type BaseLayerConfig = {
  enabled: boolean
}

export type BlockchainMethod = "storeRoot" | "anchorMerkle"

export type BlockchainConfig = BaseLayerConfig & {
  minConfirmations: number
  contractAddress: string | null
  allowedMethods: BlockchainMethod[]
}

export type ProofConfig = {
  icp: BaseLayerConfig
  merkle: BaseLayerConfig
  blockchain: BlockchainConfig
}

/* =========================
   CONSTANTS
========================= */

const SUPPORTED_CONFIG_LAYERS = [
  "icp",
  "merkle",
  "blockchain"
] as const

type SupportedConfigLayer = (typeof SUPPORTED_CONFIG_LAYERS)[number]

/* =========================
   DEFAULT CONFIG
========================= */

const DEFAULT_PROOF_CONFIG: ProofConfig = {
  icp: {
    enabled: true
  },
  merkle: {
    enabled: true
  },
  blockchain: {
    enabled: true,
    minConfirmations: 3,
    contractAddress: null,
    allowedMethods: ["storeRoot", "anchorMerkle"]
  }
}

export const PROOF_CONFIG: ProofConfig = {
  ...DEFAULT_PROOF_CONFIG,
  icp: { ...DEFAULT_PROOF_CONFIG.icp },
  merkle: { ...DEFAULT_PROOF_CONFIG.merkle },
  blockchain: {
    ...DEFAULT_PROOF_CONFIG.blockchain,
    allowedMethods: [...DEFAULT_PROOF_CONFIG.blockchain.allowedMethods]
  }
}

/* =========================
   HELPERS
========================= */

function isSupportedConfigLayer(
  layer: LayerName
): layer is SupportedConfigLayer {
  return (SUPPORTED_CONFIG_LAYERS as readonly string[]).includes(layer)
}

function normalizeAddress(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null

  const normalized = value.trim().toLowerCase()
  return normalized || null
}

function normalizeMinConfirmations(value: number): number {
  if (!Number.isFinite(value)) return 0
  if (value < 0) return 0
  return Math.floor(value)
}

function normalizeAllowedMethods(
  methods: BlockchainMethod[] | undefined
): BlockchainMethod[] {
  const validMethods: BlockchainMethod[] = ["storeRoot", "anchorMerkle"]

  if (!Array.isArray(methods)) {
    return [...validMethods]
  }

  const filtered = methods.filter(
    (method): method is BlockchainMethod => validMethods.includes(method)
  )

  return filtered.length > 0 ? [...new Set(filtered)] : [...validMethods]
}

/* =========================
   PUBLIC API
========================= */

export function isLayerEnabled(layer: LayerName): boolean {
  if (!isSupportedConfigLayer(layer)) {
    return false
  }

  return PROOF_CONFIG[layer]?.enabled === true
}

export function getBlockchainConfig(): BlockchainConfig {
  return {
    enabled: PROOF_CONFIG.blockchain.enabled === true,
    minConfirmations: normalizeMinConfirmations(
      PROOF_CONFIG.blockchain.minConfirmations
    ),
    contractAddress: normalizeAddress(
      PROOF_CONFIG.blockchain.contractAddress
    ),
    allowedMethods: normalizeAllowedMethods(
      PROOF_CONFIG.blockchain.allowedMethods
    )
  }
}

export function getProofConfig(): ProofConfig {
  return {
    icp: { ...PROOF_CONFIG.icp },
    merkle: { ...PROOF_CONFIG.merkle },
    blockchain: {
      ...getBlockchainConfig()
    }
  }
}

export function getEnabledProofLayers(): SupportedConfigLayer[] {
  return SUPPORTED_CONFIG_LAYERS.filter((layer) => isLayerEnabled(layer))
}
