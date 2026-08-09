import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// ── Types ───────────────────────────────────────────────────────────────────────────────

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: "starter" | "pro" | "pro_plus" | "enterprise" | "enterprise_plus";
  logo_url: string | null;
  primary_color: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  tenant_id: string;
  phone: string;
  name: string;
  role: "owner" | "admin" | "operator" | "viewer";
  avatar_url: string | null;
  created_at: string;
}

export interface Screen {
  id: string;
  tenant_id: string;
  name: string;
  city: string;
  address: string;
  lat: number | null;
  lng: number | null;
  type: "billboard" | "transit" | "retail" | "indoor" | "smart_city";
  size_w: number;
  size_h: number;
  status: "online" | "offline" | "maintenance";
  cpm_base: number;
  device_id: string | null;
  last_heartbeat: string | null;
  created_at: string;
}

export interface Campaign {
  id: string;
  tenant_id: string;
  name: string;
  advertiser: string;
  objective: string;
  status: "draft" | "active" | "paused" | "completed";
  budget: number;
  budget_spent: number;
  cpm: number;
  impressions: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface Creative {
  id: string;
  tenant_id: string;
  campaign_id: string | null;
  name: string;
  type: "image" | "video" | "html";
  url: string;
  duration: number;
  width: number;
  height: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface ProofOfPlay {
  id: string;
  tenant_id: string;
  screen_id: string;
  campaign_id: string;
  creative_id: string;
  duration: number;
  content_hash: string;
  merkle_root: string | null;
  polygon_tx: string | null;
  tsa_hash: string | null;
  played_at: string;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plan: Tenant["plan"];
  status: "active" | "canceled" | "past_due";
  current_period_end: string;
  stripe_subscription_id: string | null;
  pagarme_subscription_id: string | null;
}

// ── Auth helpers ───────────────────────────────────────────────────────────────────────────

export async function signInWithOTP(phone: string) {
  return supabase.auth.signInWithOtp({
    phone: phone.replace(/\D/g, "").replace(/^0/, "+55"),
  });
}

export async function verifyOTP(phone: string, token: string) {
  return supabase.auth.verifyOtp({
    phone: phone.replace(/\D/g, "").replace(/^0/, "+55"),
    token,
    type: "sms",
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}

// ── Data helpers ──────────────────────────────────────────────────────────────────────────

export async function getTenant(tenantId: string) {
  return supabase.from("tenants").select("*").eq("id", tenantId).single();
}

export async function getScreens(tenantId: string) {
  return supabase.from("screens").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false });
}

export async function getCampaigns(tenantId: string) {
  return supabase.from("campaigns").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false });
}

export async function getProofOfPlay(tenantId: string, limit = 50) {
  return supabase.from("proof_of_play").select("*, screens(name, city), campaigns(name), creatives(name)").eq("tenant_id", tenantId).order("played_at", { ascending: false }).limit(limit);
}

export async function createCampaign(campaign: Omit<Campaign, "id" | "created_at" | "budget_spent" | "impressions">) {
  return supabase.from("campaigns").insert(campaign).select().single();
}

export async function createScreen(screen: Omit<Screen, "id" | "created_at" | "last_heartbeat">) {
  return supabase.from("screens").insert(screen).select().single();
}

export async function updateScreenStatus(screenId: string, status: Screen["status"]) {
  return supabase.from("screens").update({ status, last_heartbeat: new Date().toISOString() }).eq("id", screenId);
}
