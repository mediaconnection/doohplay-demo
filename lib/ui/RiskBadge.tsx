// @ts-nocheck
"use client"

export function RiskBadge({
  level
}: {
  level: "low" | "medium" | "high" | "critical"
}) {

  const map = {
    low: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700"
  }

  const label = {
    low: "Low Risk",
    medium: "Medium Risk",
    high: "High Risk",
    critical: "Critical Risk"
  }

  return (
    <span className={`px-3 py-1 rounded text-sm ${map[level]}`}>
      {label[level]}
    </span>
  )
}
