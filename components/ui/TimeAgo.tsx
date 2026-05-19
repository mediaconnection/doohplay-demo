"use client"

import { useEffect, useMemo, useState } from "react"

type TimeAgoProps = {
  date?: string | Date | null
  className?: string
  fallback?: string
  futureLabel?: string
}

function formatRelative(diffMs: number): string {
  const seconds = Math.floor(diffMs / 1_000)
  const minutes = Math.floor(diffMs / 60_000)
  const hours = Math.floor(diffMs / 3_600_000)
  const days = Math.floor(diffMs / 86_400_000)

  if (seconds < 30) return "agora"
  if (minutes < 1) return "menos de 1 min atrás"
  if (minutes < 60) return `${minutes} min atrás`
  if (hours < 24) return `${hours}h atrás`
  if (days < 30) return `${days}d atrás`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months} mês${months > 1 ? "es" : ""} atrás`

  const years = Math.floor(days / 365)
  return `${years} ano${years > 1 ? "s" : ""} atrás`
}

export default function TimeAgo({
  date,
  className,
  fallback = "—",
  futureLabel = "agendado"
}: TimeAgoProps) {
  const [now, setNow] = useState(() => Date.now())

  const parsedDate = useMemo(() => {
    if (!date) return null

    const d = new Date(date)
    return Number.isNaN(d.getTime()) ? null : d
  }, [date])

  useEffect(() => {
    if (!parsedDate) return

    const interval = window.setInterval(() => {
      setNow(Date.now())
    }, 60_000)

    return () => window.clearInterval(interval)
  }, [parsedDate])

  if (!parsedDate) {
    return <span className={className}>{fallback}</span>
  }

  const diff = now - parsedDate.getTime()
  const title = parsedDate.toLocaleString("pt-BR")

  return (
    <span className={className} title={title}>
      {diff < 0 ? futureLabel : formatRelative(diff)}
    </span>
  )
}