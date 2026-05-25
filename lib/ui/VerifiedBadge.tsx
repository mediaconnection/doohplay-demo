// @ts-nocheck
"use client"

import clsx from "clsx"

/* =========================
   TYPES
========================= */

export type VerifiedBadgeSize = "sm" | "md" | "lg"

export type VerifiedBadgeProps = {
  valid?: boolean | null
  label?: string
  showIcon?: boolean
  size?: VerifiedBadgeSize
  className?: string
  withPulse?: boolean
  title?: string
  ariaLabel?: string
}

type BadgeTone = {
  className: string
  label: string
  icon: string
}

/* =========================
   STYLES
========================= */

const sizeMap: Record<VerifiedBadgeSize, string> = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
  lg: "text-base px-4 py-1.5"
}

function getStatusStyle(valid: boolean | null | undefined): BadgeTone {
  if (valid === true) {
    return {
      className: "border-green-200 bg-green-100 text-green-700",
      label: "Verified Proof",
      icon: "✔"
    }
  }

  if (valid === false) {
    return {
      className: "border-red-200 bg-red-100 text-red-700",
      label: "Invalid Proof",
      icon: "✖"
    }
  }

  return {
    className: "border-zinc-200 bg-zinc-100 text-zinc-700",
    label: "Pending Verification",
    icon: "…"
  }
}

/* =========================
   COMPONENT
========================= */

export function VerifiedBadge({
  valid = true,
  label,
  showIcon = true,
  size = "md",
  className = "",
  withPulse = false,
  title,
  ariaLabel
}: VerifiedBadgeProps) {
  const tone = getStatusStyle(valid)

  const baseStyle =
    "inline-flex items-center gap-2 rounded-full border font-medium transition-all"

  const pulseStyle =
    withPulse && valid !== false ? "animate-pulse" : ""

  const finalLabel = label ?? tone.label
  const resolvedAriaLabel = ariaLabel ?? finalLabel

  return (
    <span
      className={clsx(
        baseStyle,
        tone.className,
        sizeMap[size],
        pulseStyle,
        className
      )}
      title={title ?? finalLabel}
      aria-label={resolvedAriaLabel}
    >
      {showIcon ? (
        <span aria-hidden="true">{tone.icon}</span>
      ) : null}

      <span>{finalLabel}</span>
    </span>
  )
}

/* =========================
   VARIANTS
========================= */

export function Verified({ className }: { className?: string }) {
  return <VerifiedBadge valid={true} className={className} />
}

export function NotVerified({ className }: { className?: string }) {
  return <VerifiedBadge valid={false} className={className} />
}

export function PendingVerifiedBadge({
  className
}: {
  className?: string
}) {
  return <VerifiedBadge valid={null} className={className} />
}

export default VerifiedBadge
