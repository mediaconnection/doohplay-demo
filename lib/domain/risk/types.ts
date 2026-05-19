// /lib/domain/risk/types.ts

export type RiskInput = {
  score: number
  fraudProbability: number
  anomalyLevel: number
  invalidTrafficRate: number
  chargebackRate: number
}