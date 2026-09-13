// components/ui/Badge.tsx
// Badge real do sistema de design (Fase 2/3, ver STATUS_PROJETO.md).
// Substitui o scaffold Tailwind anterior (zero consumidor real,
// desconectado de lib/theme.ts) — mesmo caminho e alias @/components/ui/Badge.
// "example" mapeia pro selo "⭐ Simulação" (convenção de 30/08/2026, cor purple*).
"use client"
import * as React from "react"
import { radius, typography } from "./tokens"
import type { UiTheme } from "./theme-shape"

export type BadgeStatus = "online" | "offline" | "warning" | "info" | "example"

interface BadgeProps {
  theme: UiTheme
  status: BadgeStatus
  children: React.ReactNode
}

export function Badge({ theme, status, children }: BadgeProps) {
  const map: Record<BadgeStatus, { bg: string; border: string; color: string }> = {
    online: { bg: theme.greenLt ?? theme.green, border: theme.greenBd ?? theme.green, color: theme.green },
    offline: { bg: theme.redLt ?? theme.red, border: theme.redBd ?? theme.red, color: theme.red },
    warning: {
      bg: theme.amberLt ?? theme.amber ?? theme.red,
      border: theme.amber ?? theme.red,
      color: theme.amber ?? theme.red,
    },
    info: { bg: theme.blueLt ?? theme.blue, border: theme.blueBd ?? theme.blue, color: theme.blue },
    example: {
      bg: theme.purpleLt ?? theme.blueLt ?? theme.blue,
      border: theme.purpleBd ?? theme.blueBd ?? theme.blue,
      color: theme.purple ?? theme.blue,
    },
  }
  const c = map[status]
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: radius.pill,
        padding: "3px 10px",
        fontSize: typography.caption.fontSize,
        fontWeight: 600,
        color: c.color,
      }}
    >
      {children}
    </span>
  )
}

export default Badge
