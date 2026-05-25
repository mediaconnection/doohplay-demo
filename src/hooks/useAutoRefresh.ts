// @ts-nocheck
"use client"

import { useEffect } from "react"

export function useAutoRefresh(refetch: () => void, interval = 10000) {
  useEffect(() => {
    const id = setInterval(refetch, interval)
    return () => clearInterval(id)
  }, [refetch, interval])
}
