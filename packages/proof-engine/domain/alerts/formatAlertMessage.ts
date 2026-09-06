// @ts-nocheck
// lib/domain/alerts/formatAlertMessage.ts

import { Alert } from "./types"

export function formatAlertMessage(
  campaignId: string,
  alerts: Alert[]
) {
  return `
🚨 DOOHPLAY ALERT

Campaign: ${campaignId}

${alerts.map(a =>
  `• [${a.severity.toUpperCase()}] ${a.type} → ${a.message}`
).join("\n")}
  `
}
