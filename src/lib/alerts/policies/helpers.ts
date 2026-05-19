import type { AlertContext } from "./types"

export function metadataString(
  ctx: AlertContext,
  key: string
): string | null {
  const value = ctx.input.metadata?.[key]

  if (typeof value !== "string") return null

  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

export function metadataNumber(
  ctx: AlertContext,
  key: string
): number | null {
  const value = ctx.input.metadata?.[key]

  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)

    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return null
}

export function metadataBoolean(
  ctx: AlertContext,
  key: string
): boolean | null {
  const value = ctx.input.metadata?.[key]

  if (typeof value === "boolean") return value

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()

    if (normalized === "true") return true
    if (normalized === "false") return false
    if (normalized === "1") return true
    if (normalized === "0") return false
  }

  if (typeof value === "number") {
    if (value === 1) return true
    if (value === 0) return false
  }

  return null
}

export function isType(ctx: AlertContext, type: string): boolean {
  return ctx.input.type.trim().toUpperCase() === type.trim().toUpperCase()
}

export function metadataArray(
  ctx: AlertContext,
  key: string
): unknown[] {
  const value = ctx.input.metadata?.[key]
  return Array.isArray(value) ? value : []
}