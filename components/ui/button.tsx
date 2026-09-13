// components/ui/button.tsx
// Button real do sistema de design (Fase 2/3, ver STATUS_PROJETO.md).
// Substitui o scaffold Tailwind anterior (zero consumidor real,
// desconectado de lib/theme.ts) — mesmo caminho e alias @/components/ui/button.
"use client"
import * as React from "react"
import { radius, spacing, typography } from "./tokens"
import type { UiTheme } from "./theme-shape"

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"
type ButtonSize = "sm" | "md"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme: UiTheme
  variant?: ButtonVariant
  size?: ButtonSize
}

const SIZES: Record<ButtonSize, { padding: string; fontSize: number }> = {
  sm: { padding: `${spacing[1]}px ${spacing[2]}px`, fontSize: typography.caption.fontSize },
  md: { padding: `${spacing[2]}px ${spacing[4]}px`, fontSize: typography.body.fontSize },
}

export function Button({ theme, variant = "secondary", size = "md", style, children, ...props }: ButtonProps) {
  const variants: Record<ButtonVariant, React.CSSProperties> = {
    primary: { background: theme.blue, color: theme.white, border: "none", fontWeight: 600 },
    secondary: { background: theme.white, color: theme.text, border: `1px solid ${theme.border}`, fontWeight: 500 },
    ghost: { background: "transparent", color: theme.blue, border: "none", fontWeight: 700 },
    danger: { background: theme.red, color: theme.white, border: "none", fontWeight: 600 },
  }
  const sz = SIZES[size]
  return (
    <button
      style={{
        borderRadius: radius.chip,
        cursor: "pointer",
        padding: sz.padding,
        fontSize: sz.fontSize,
        ...variants[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
