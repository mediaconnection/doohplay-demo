// components/ui/card.tsx
// Card real do sistema de design (Fase 2/3, ver STATUS_PROJETO.md).
// Substitui o scaffold Tailwind anterior (zero consumidor real,
// desconectado de lib/theme.ts) — mesmo caminho e alias @/components/ui/card.
"use client"
import * as React from "react"
import { radius, elevation, spacing, type ElevationLevel } from "./tokens"
import type { UiTheme } from "./theme-shape"

type CardPadding = "none" | "compact" | "comfortable"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  theme: UiTheme
  elevation?: ElevationLevel
  padding?: CardPadding
}

const PADDING: Record<CardPadding, number> = { none: 0, compact: spacing[4], comfortable: spacing[5] }

export function Card({ theme, elevation: el = "sm", padding = "none", style, children, ...props }: CardProps) {
  return (
    <div
      style={{
        background: theme.white,
        border: `1px solid ${theme.border}`,
        borderRadius: radius.card,
        boxShadow: elevation[el],
        padding: PADDING[padding],
        overflow: "hidden",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
