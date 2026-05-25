// @ts-nocheck
// /lib/observability/metrics.ts

import { broadcast } from "@/lib/realtime/wsServer"

/* =========================
   TYPES
========================= */

type CounterMap = Record<string, number>

type HistogramBucket = {
  count: number
  sum: number
  min: number
  max: number
}

type HistogramMap = Record<string, HistogramBucket>

type HistogramSnapshot = HistogramBucket & {
  avg: number
}

/* =========================
   STATE (in-memory)
========================= */

const counters: CounterMap = Object.create(null)
const histograms: HistogramMap = Object.create(null)

/* =========================
   HELPERS
========================= */

function isValidNumber(v: number) {
  return typeof v === "number" && Number.isFinite(v)
}

/* =========================
   COUNTERS
========================= */

export function increment(metric: string, value = 1) {
  if (!metric || !isValidNumber(value)) return

  counters[metric] = (counters[metric] || 0) + value

  // 🔥 realtime broadcast
  broadcast({
    type: "metric_update",
    metric,
    value: counters[metric]
  })
}

export function setCounter(metric: string, value: number) {
  if (!metric || !isValidNumber(value)) return

  counters[metric] = value

  broadcast({
    type: "metric_update",
    metric,
    value
  })
}

export function getCounters(): CounterMap {
  return { ...counters }
}

/* =========================
   HISTOGRAMS
========================= */

export function observe(metric: string, value: number) {
  if (!metric || !isValidNumber(value)) return

  if (!histograms[metric]) {
    histograms[metric] = {
      count: 0,
      sum: 0,
      min: value,
      max: value
    }
  }

  const h = histograms[metric]

  h.count += 1
  h.sum += value
  h.min = Math.min(h.min, value)
  h.max = Math.max(h.max, value)

  broadcast({
    type: "histogram_update",
    metric,
    value
  })
}

export function getAverage(metric: string): number {
  const h = histograms[metric]
  if (!h || h.count === 0) return 0
  return h.sum / h.count
}

export function getHistograms(): HistogramMap {
  return { ...histograms }
}

/* =========================
   RESET
========================= */

export function resetMetrics() {
  Object.keys(counters).forEach((k) => delete counters[k])
  Object.keys(histograms).forEach((k) => delete histograms[k])
}

/* =========================
   SNAPSHOT
========================= */

export function getMetrics() {
  const histoWithAvg: Record<string, HistogramSnapshot> = {}

  for (const key in histograms) {
    const h = histograms[key]

    histoWithAvg[key] = {
      ...h,
      avg: h.count > 0 ? h.sum / h.count : 0
    }
  }

  return {
    counters: getCounters(),
    histograms: histoWithAvg,
    timestamp: new Date().toISOString()
  }
}
