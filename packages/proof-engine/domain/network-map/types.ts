/* =========================
   NETWORK MAP TYPES
========================= */

export type NetworkMapStatus = "online" | "offline"

export type NetworkMapRisk = "SAFE" | "WATCH" | "HIGH_RISK"

/* =========================
   METADATA (PLAYER INFO)
========================= */

export type NetworkMapMetadata = {
  location?: string | null
  deviceType?: string | null
  platform?: string | null
  playerCode?: string | null
}

/* =========================
   ITEM (MAP NODE)
========================= */

export type NetworkMapItem = {
  id: string
  name: string
  latitude: number | null
  longitude: number | null
  status: NetworkMapStatus
  score: number
  risk: NetworkMapRisk
  executions: number
  invalidEvents: number
  lastSeenAt: string | null
  metadata?: NetworkMapMetadata
}

/* =========================
   SUMMARY
========================= */

export type NetworkMapSummary = {
  total: number
  online: number
  offline: number
  safe: number
  watch: number
  highRisk: number

  // 🔥 NOVO — essencial para o mapa
  withCoordinates: number
  withoutCoordinates: number

  generatedAt: string
}

/* =========================
   API RESPONSE
========================= */

export type NetworkMapResponse = {
  success: boolean
  data: NetworkMapItem[]
  summary?: NetworkMapSummary
  error?: string
}