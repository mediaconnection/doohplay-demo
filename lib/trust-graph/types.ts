export type NodeType =
  | "screen"
  | "player"
  | "campaign"
  | "advertiser"
  | "operator"
  | "event"
  | "device"
  | "wallet"
  | "block"
  | "certificate"
  | "source"
  | "source_table"
  | "event_type"
  | "display"
  | "anchor"
  | "anchored"
  | "unknown"

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH"
export type TrustGraphRiskLabel = "SAFE" | "WATCH" | "HIGH_RISK"

export type GraphId = string

export type GraphNodeRef =
  | GraphId
  | {
      id: GraphId
    }

export type GraphMetadata = Readonly<Record<string, unknown>>

export type GraphNode = {
  id: GraphId
  type?: NodeType
  label?: string
  trust?: number
  score?: number
  metadata?: GraphMetadata
}

export type GraphEdge = {
  id?: string
  source: GraphNodeRef
  target: GraphNodeRef
  relation?: string
  weight?: number
  risk?: RiskLevel
  createdAt?: string
  metadata?: GraphMetadata
}

export type FraudCluster = {
  id: string
  nodeIds: GraphId[]
  edgeIds: string[]
  highRiskEdges: number
  mediumRiskEdges: number
  repeatedConnections: number
  avgWeight: number
  density: number
  recencyScore: number
  severity: RiskLevel
}

export type FraudScoreBreakdown = {
  connectivity: number
  riskExposure: number
  suspiciousWeight: number
  recurrence: number
  final: number
  reasons: string[]
}

/* =========================
   BACKEND TRUST GRAPH
========================= */

export type TrustGraphFilters = {
  hours: number
  limitNodes: number
  limitEdges: number
  campaignId?: string | null
  advertiserId?: string | null
  deviceId?: string | null
}

export type TrustGraphNode = {
  id: string
  label: string
  type: NodeType
  score: number
  risk: TrustGraphRiskLabel
  executions: number
  invalidEvents: number
  lastSeenAt: string | null
  metadata?: GraphMetadata
}

export type TrustGraphEdge = {
  id: string
  source: string
  target: string
  relation: string
  weight: number
  risk: RiskLevel
  executions: number
  invalidEvents: number
  lastSeenAt: string | null
  metadata?: GraphMetadata
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

export type TrustGraphResponse = {
  nodes: TrustGraphNode[]
  edges: TrustGraphEdge[]
  summary: TrustGraphSummary
}

export type TrustGraphRouteSuccess = {
  ok: true
} & TrustGraphResponse

export type TrustGraphRouteError = {
  ok: false
  error: string
  message: string
}

export type TrustGraphRouteResponse =
  | TrustGraphRouteSuccess
  | TrustGraphRouteError