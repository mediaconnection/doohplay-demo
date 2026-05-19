export type TrustGraphNodeType =
  | "device"
  | "campaign"
  | "advertiser"
  | "publisher"
  | "player"
  | "unknown"

export type TrustGraphRiskLabel = "SAFE" | "WATCH" | "HIGH_RISK"

export type TrustGraphNode = {
  id: string
  label: string
  type: TrustGraphNodeType
  score: number
  risk: TrustGraphRiskLabel
  executions: number
  invalidEvents: number
  lastSeenAt: string | null
  metadata?: Record<string, unknown>
}

export type TrustGraphEdge = {
  id: string
  source: string
  target: string
  relation: string
  weight: number
  risk: TrustGraphRiskLabel
  executions: number
  invalidEvents: number
  lastSeenAt: string | null
  metadata?: Record<string, unknown>
}

export type TrustGraphSummary = {
  totalNodes: number
  totalEdges: number
  safeNodes: number
  watchNodes: number
  highRiskNodes: number
  periodHours: number
  generatedAt: string
}

export type TrustGraphFilters = {
  hours: number
  limitNodes: number
  limitEdges: number
  campaignId?: string | null
  advertiserId?: string | null
  deviceId?: string | null
}

export type TrustGraphResponse = {
  nodes: TrustGraphNode[]
  edges: TrustGraphEdge[]
  summary: TrustGraphSummary
  filters?: TrustGraphFilters
}