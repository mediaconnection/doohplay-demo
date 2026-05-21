import { useEffect } from 'react'

export function useAutoRefresh(callback: () => void, intervalMs = 30000) {
  useEffect(() => {
    const interval = setInterval(callback, intervalMs)
    return () => clearInterval(interval)
  }, [callback, intervalMs])
}