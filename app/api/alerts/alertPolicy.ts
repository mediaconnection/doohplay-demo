export const ALERT_POLICIES = {
  PLAYER_OFFLINE: {
    cooldownMinutes: 5,
    severity: "critical",
  },
  EXECUTION_FAILED: {
    cooldownMinutes: 1,
    severity: "warning",
  },
} as const;
