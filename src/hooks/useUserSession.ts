import { useState, useEffect, useCallback } from "react";
import { projectId } from "../../utils/supabase/info";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-dfbecf08`;

export interface Screen {
  id: string;
  name: string;
  location: string;
  size: string;
  status: string;
  createdAt: string;
}

export interface UserSession {
  phone: string;
  name: string;
  profile: "owner" | "advertiser" | "agency" | "partner" | "admin";
  plan: "starter" | "pro" | "business";
  businessType: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiQuota {
  used: number;
  limit: number;
  remaining: number;
  plan: string;
}

const PLAN_ORDER: Record<string, number> = { starter: 0, pro: 1, business: 2 };

export function useUserSession() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [aiQuota, setAiQuota] = useState<AiQuota | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("doohplay_phone");
    if (saved) loadSession(saved);
  }, []);

  const loadSession = useCallback(async (phone: string) => {
    setLoading(true);
    try {
      const [sessRes, screensRes, quotaRes] = await Promise.all([
        fetch(`${BASE}/session/${encodeURIComponent(phone)}`),
        fetch(`${BASE}/screens/${encodeURIComponent(phone)}`),
        fetch(`${BASE}/ai-quota/${encodeURIComponent(phone)}`),
      ]);
      if (sessRes.ok) {
        const s = await sessRes.json();
        setSession(s);
        localStorage.setItem("doohplay_phone", phone);
      }
      if (screensRes.ok) setScreens(await screensRes.json());
      if (quotaRes.ok) setAiQuota(await quotaRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (data: {
    phone: string; name: string; profile: string; plan: string; businessType?: string;
  }) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const s = await res.json();
      setSession(s);
      localStorage.setItem("doohplay_phone", data.phone);
      const [screensRes, quotaRes] = await Promise.all([
        fetch(`${BASE}/screens/${encodeURIComponent(data.phone)}`),
        fetch(`${BASE}/ai-quota/${encodeURIComponent(data.phone)}`),
      ]);
      if (screensRes.ok) setScreens(await screensRes.json());
      if (quotaRes.ok) setAiQuota(await quotaRes.json());
      return s;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("doohplay_phone");
    setSession(null);
    setScreens([]);
    setAiQuota(null);
  }, []);

  const upgradePlan = useCallback(async (plan: string) => {
    if (!session) return;
    const res = await fetch(`${BASE}/session/${encodeURIComponent(session.phone)}/plan`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const updated = await res.json();
    setSession(updated);
    const quotaRes = await fetch(`${BASE}/ai-quota/${encodeURIComponent(session.phone)}`);
    if (quotaRes.ok) setAiQuota(await quotaRes.json());
    return updated;
  }, [session]);

  const addScreen = useCallback(async (data: { name?: string; location?: string; size?: string }) => {
    if (!session) return;
    const res = await fetch(`${BASE}/screens/${encodeURIComponent(session.phone)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const screen = await res.json();
    setScreens(prev => [...prev, screen]);
    return screen;
  }, [session]);

  const removeScreen = useCallback(async (id: string) => {
    if (!session) return;
    await fetch(`${BASE}/screens/${encodeURIComponent(session.phone)}/${id}`, { method: "DELETE" });
    setScreens(prev => prev.filter(s => s.id !== id));
  }, [session]);

  const incrementAiUsage = useCallback(async () => {
    if (!session) return { allowed: false };
    const res = await fetch(`${BASE}/ai-quota/${encodeURIComponent(session.phone)}/increment`, { method: "POST" });
    if (res.status === 429) return { allowed: false, quota: await res.json() };
    const quota = await res.json();
    setAiQuota(quota);
    return { allowed: true, quota };
  }, [session]);

  const hasFeature = useCallback((minPlan: "starter" | "pro" | "business") => {
    if (!session) return false;
    return PLAN_ORDER[session.plan] >= PLAN_ORDER[minPlan];
  }, [session]);

  const screenLimit = session ? ({ starter: 1, pro: 5, business: 20 }[session.plan] ?? 1) : 1;
  const canAddScreen = screens.length < screenLimit;

  return {
    session,
    screens,
    aiQuota,
    loading,
    login,
    logout,
    upgradePlan,
    addScreen,
    removeScreen,
    incrementAiUsage,
    hasFeature,
    canAddScreen,
    screenLimit,
    isLoggedIn: !!session,
  };
}
