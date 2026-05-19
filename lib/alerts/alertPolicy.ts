export const ALERT_POLICIES = {
  PLAYER_OFFLINE: {
    type: "PLAYER_OFFLINE",
    severity: "HIGH",
    threshold_seconds: 300
  }
} as const

export default ALERT_POLICIES