import * as React from "react"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors"
  const variants: Record<BadgeVariant, string> = {
    default: "border-transparent bg-slate-900 text-white",
    secondary: "border-transparent bg-slate-100 text-slate-900",
    destructive: "border-transparent bg-red-500 text-white",
    outline: "text-slate-900",
  }
  return (
    <div className={`${base} ${variants[variant]} ${className}`} {...props} />
  )
}

export default Badge
export { Badge }