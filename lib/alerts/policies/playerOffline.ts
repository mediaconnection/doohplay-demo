// @ts-nocheck
import type { AlertPolicy } from "./types"
import { isType, metadataNumber } from "./helpers"

const POLICY_TYPE = "PLAYER_OFFLINE"
const OFFLINE_THRESHOLD_SECONDS = 300

export const PLAYER_OFFLINE_POLICY: AlertPolicy = {
  type: POLICY_TYPE,
  severity: "HIGH",
  priority: 100,
  threshold_seconds: OFFLINE_THRESHOLD_SECONDS,

  condition(ctx) {
    if (!isType(ctx, POLICY_TYPE)) return false

    const offlineSeconds = metadataNumber(ctx, "offline_seconds")

    /*
     * Se não vier offline_seconds, ainda abre alerta.
     * Isso mantém compatibilidade com rotas antigas que só enviam type/sourceId.
     */
    if (offlineSeconds === null) return true

    return offlineSeconds >= OFFLINE_THRESHOLD_SECONDS
  },

  risk: {
    base: 70,
    multiplier: 1.15
  },

  enrich(ctx) {
    const offlineSeconds = metadataNumber(ctx, "offline_seconds")

    return {
      policy: POLICY_TYPE,
      threshold_seconds: OFFLINE_THRESHOLD_SECONDS,
      offline_seconds: offlineSeconds,
      threshold_exceeded:
        offlineSeconds === null
          ? null
          : offlineSeconds >= OFFLINE_THRESHOLD_SECONDS,
      trust_score: ctx.trust?.score ?? null,
      trust_label: ctx.trust?.label ?? null,
      audit_category: "availability",
      audit_impact: "player_unavailable_for_campaign_delivery",
      recommended_action: "check_player_connectivity_and_campaign_delivery_status"
    }
  }
}
