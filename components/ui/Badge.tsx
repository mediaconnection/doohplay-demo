import * as React from "react"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "warning" | "success" | "info"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
  label?: string
}

function Badge({ className = "", variant = "default", label, children, ...props }: BadgeProps) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors"
  const variants: Record<BadgeVariant, string> = {
    default: "border-transparent bg-slate-900 text-white",
    secondary: "border-transparent bg-slate-100 text-slate-900",
    destructive: "border-transparent bg-red-500 text-white",
    outline: "text-slate-900",
    warning: "border-transparent bg-amber-100 text-amber-800",
    success: "border-transparent bg-green-100 text-green-800",
    info: "border-transparent bg-blue-100 text-blue-800",
  }
  return (
    <div className={`${base} ${variants[variant]} ${className}`} {...props}>
      {label ?? children}
    </div>
  )
}

export default Badge
export { Badge }