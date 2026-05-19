// src/services/reports/fetchPlaybackLogs.ts
// 🔎 Busca logs de exibição para geração de relatório

import { supabaseServer } from "@/lib/supabaseServer";

interface PlaybackLog {
  player_id: string;
  duration_seconds: number;
  started_at: string;
}

/**
 * Busca logs de playback no período informado.
 * ⚠️ Ordem explícita para garantir determinismo.
 */
export async function fetchPlaybackLogs(
  periodStart: string,
  periodEnd: string
): Promise<PlaybackLog[]> {
  const { data, error } = await supabaseServer
    .from("playback_logs")
    .select("player_id, duration_seconds, started_at")
    .gte("started_at", periodStart)
    .lt("started_at", periodEnd)
    .order("started_at", { ascending: true })
    .order("player_id", { ascending: true });

  if (error) {
    throw new Error(`Falha ao buscar playback logs: ${error.message}`);
  }

  return data ?? [];
}