// components/ui/SectionTitle.tsx
// Cabeçalho de card do sistema de design (Fase 2/3, ver STATUS_PROJETO.md).
"use client"
import * as React from "react"
import { typography, spacing, type TypoLevel } from "./tokens"
import type { UiTheme } from "./theme-shape"

interface SectionTitleProps {
  theme: UiTheme
  level?: TypoLevel
  action?: React.ReactNode
  children: React.ReactNode
}

export function SectionTitle({ theme, level = "label", action, children }: SectionTitleProps) {
  const t = typography[level]
  return (
    <div
      style={{
        padding: `${spacing[4]}px ${spacing[5]}px`,
        borderBottom: `1px solid ${theme.border2 ?? theme.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: t.fontSize, fontWeight: t.fontWeight, color: theme.text }}>{children}</span>
      {action}
    </div>
  )
}

export default SectionTitle
