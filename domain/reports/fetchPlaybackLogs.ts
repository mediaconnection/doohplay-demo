import { supabase } from "@/lib/supabase";

export async function fetchPlaybackLogs(
  periodStart: string,
  periodEnd: string
) {
  const { data, error } = await supabase
    .from("playback_logs")
    .select("player_id, duration_seconds, started_at")
    .gte("started_at", periodStart)
    .lt("started_at", periodEnd);

  if (error) throw error;
  return data;
}