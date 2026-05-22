"use client";

import { useEffect, useRef, useState } from "react";

/* =========================
   TYPES
========================= */

export type DashboardData = {
  kpis: Record<string, any>;
  executions: any[];
  campaigns: any[];
  players: any[];
  watchdog: {
    alerts?: { id: string; message: string }[];
  };
  sla: Record<string, any>;
};

/* =========================
   CACHE (in-memory)
========================= */

const cache = new Map<string, DashboardData>();

/* =========================
   HOOK
========================= */

export function useDashboardData(start: string, end: string) {

  const key = `${start}-${end}`;

  const [data, setData] = useState<DashboardData | null>(
    cache.get(key) || null
  );
  const [loading, setLoading] = useState(!cache.has(key));
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);

  /* =========================
     FETCH
  ========================= */

  async function fetchData() {
    try {
      setError(null);

      const res = await fetch(
        `/api/dashboard?start=${start}&end=${end}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch dashboard");
      }

      const json: DashboardData = await res.json();

      cache.set(key, json);

      if (isMounted.current) {
        setData(json);
        setLoading(false);
      }

    } catch (err: any) {
      console.error("DASHBOARD_FETCH_ERROR", err);

      if (isMounted.current) {
        setError(err.message || "Unknown error");
        setLoading(false);
      }
    }
  }

  /* =========================
     EFFECT
  ========================= */

  useEffect(() => {
    isMounted.current = true;

    // 🔥 evita flicker se já tem cache
    if (!cache.has(key)) {
      setLoading(true);
    }

    fetchData();

    const interval = setInterval(fetchData, 30000);

    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };

  }, [key]);

  /* =========================
     RETURN
  ========================= */

  return {
    data,
    loading,
    error,
    isCached: cache.has(key)
  };
}