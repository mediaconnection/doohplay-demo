"use client"

import clsx from "clsx"

/* =========================
   TYPES
========================= */

export type StatusPillStatus =
  | "VERIFIED"
  | "WARNING"
  | "FAILED"
  | "PENDING"

export type StatusPillProps = {
  status: StatusPillStatus | string | null | undefined
  className?: string
  showIcon?: boolean
  size?: "sm" | "md" | "lg"
  title?: string
}

/* =========================
   STYLES
========================= */

const sizeMap = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
  lg: "text-base px-4 py-1.5"
} as const

function normalizeStatus(
  status: StatusPillProps["status"]
): StatusPillStatus {
  if (status === "VERIFIED") return "VERIFIED"
  if (status === "WARNING") return "WARNING"
  if (status === "FAILED") return "FAILED"
  return "PENDING"
}

function getTone(status: StatusPillStatus) {
  switch (status) {
    case "VERIFIED":
      return {
        className: "border-green-200 bg-green-100 text-green-700",
        icon: "✔"
      }

    case "WARNING":
      return {
        className: "border-amber-200 bg-amber-100 text-amber-700",
        icon: "⚠"
      }

    case "FAILED":
      return {
        className: "border-red-200 bg-red-100 text-red-700",
        icon: "✖"
      }

    case "PENDING":
    default:
      return {
        className: "border-zinc-200 bg-zinc-100 text-zinc-700",
        icon: "…"
      }
  }
}

/* =========================
   COMPONENT
========================= */

export function StatusPill({
  status,
  className,
  showIcon = true,
  size = "md",
  title
}: StatusPillProps) {
  const normalized = normalizeStatus(status)
  const tone = getTone(normalized)

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border font-medium",
        tone.className,
        sizeMap[size],
        className
      )}
      title={title ?? normalized}
      aria-label={normalized}
    >
      {showIcon ? <span aria-hidden="true">{tone.icon}</span> : null}
      <span>{normalized}</span>
    </span>
  )
}

export default StatusPill