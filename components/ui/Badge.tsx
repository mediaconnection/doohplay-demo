import type { HTMLAttributes, ReactNode } from "react"

type BadgeProps = {
  label?: string
  children?: ReactNode
  variant?: string
  className?: string
} & HTMLAttributes<HTMLSpanElement>

export default function Badge({
  label,
  children,
  variant = "gray",
  className,
  ...rest
}: BadgeProps) {
  const styles: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    success: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    warning: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
    danger: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700"
  }

  const normalizedVariant = String(variant || "gray").toLowerCase()
  const variantStyle = styles[normalizedVariant] ?? styles.gray

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium",
        variantStyle,
        className
      ]
        .filter(Boolean)
        .join(" ")}
      data-variant={normalizedVariant}
      {...rest}
    >
      {children ?? label ?? "—"}
    </span>
  )
}