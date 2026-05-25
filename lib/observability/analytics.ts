// @ts-nocheck
// /lib/observability/analytics.ts

/* =========================
   TYPES
========================= */

type AnalyticsPayload = Record<string, any>

type TrackOptions = {
  userId?: string
  anonymousId?: string
  timestamp?: number
}

/* =========================
   ENV
========================= */

const isDev = process.env.NODE_ENV !== "production"

/* =========================
   CORE TRACK FUNCTION
========================= */

export function track(
  event: string,
  data?: AnalyticsPayload,
  options?: TrackOptions
) {
  const payload = {
    event,
    data: data || {},
    userId: options?.userId || null,
    anonymousId: options?.anonymousId || null,
    timestamp: options?.timestamp || Date.now()
  }

  /* =========================
     DEV LOG
  ========================= */

  if (isDev) {
    console.log("[ANALYTICS]", JSON.stringify(payload, null, 2))
  }

  /* =========================
     PROVIDERS (EXTENSÃO)
  ========================= */

  try {
    sendToProviders(payload)
  } catch (err) {
    console.error("ANALYTICS_ERROR:", err)
  }
}

/* =========================
   PROVIDERS
========================= */

function sendToProviders(payload: any) {

  /* =========================
     POSTHOG (EXEMPLO)
  ========================= */
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    // futuramente:
    // posthog.capture(payload.event, payload.data)
  }

  /* =========================
     GOOGLE ANALYTICS (EXEMPLO)
  ========================= */
  if (typeof window !== "undefined" && (window as any).gtag) {
    ;(window as any).gtag("event", payload.event, payload.data)
  }

  /* =========================
     CUSTOM BACKEND (OPCIONAL)
  ========================= */

  if (process.env.ANALYTICS_ENDPOINT) {
    fetch(process.env.ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }).catch(() => {
      // silencioso (não quebrar app)
    })
  }
}

/* =========================
   PREDEFINED EVENTS
========================= */

export const AnalyticsEvents = {
  PROOF_VIEWED: "proof_viewed",
  PROOF_VERIFIED: "proof_verified",
  PROOF_FAILED: "proof_failed",
  API_ERROR: "api_error"
} as const

/* =========================
   HELPERS
========================= */

/**
 * Track de visualização de proof
 */
export function trackProofViewed(hash: string, valid: boolean) {
  track(AnalyticsEvents.PROOF_VIEWED, {
    hash,
    valid
  })
}

/**
 * Track de erro
 */
export function trackError(message: string, context?: any) {
  track(AnalyticsEvents.API_ERROR, {
    message,
    context
  })
}
