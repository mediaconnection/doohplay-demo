// src/services/reports/generateConsolidatedReport.ts

import { ConsolidatedReport } from "@/domain/reports/consolidatedReport";

interface GenerateReportParams {
  logs: Array<{
    player_id: string;
    duration_seconds: number;
    started_at: string;
  }>;
  periodStart: string;
  periodEnd: string;
}

export function generateConsolidatedReport(
  params: GenerateReportParams
): ConsolidatedReport {
  const { logs, periodStart, periodEnd } = params;

  const playersMap = new Map<
    string,
    { playerId: string; plays: number; durationSeconds: number }
  >();

  let totalPlays = 0;
  let totalDuration = 0;

  for (const log of logs) {
    totalPlays += 1;
    totalDuration += log.duration_seconds;

    if (!playersMap.has(log.player_id)) {
      playersMap.set(log.player_id, {
        playerId: log.player_id,
        plays: 0,
        durationSeconds: 0,
      });
    }

    const player = playersMap.get(log.player_id)!;
    player.plays += 1;
    player.durationSeconds += log.duration_seconds;
  }

  return {
    version: "1.0",
    platform: "DOOHPLAY",
    period: {
      start: periodStart,
      end: periodEnd,
      timezone: "America/Sao_Paulo",
    },
    generatedAt: new Date().toISOString(), // informativo
    summary: {
      totalPlayers: playersMap.size,
      totalPlays,
      totalDurationSeconds: totalDuration,
    },
    players: Array.from(playersMap.values()).sort((a, b) =>
      a.playerId.localeCompare(b.playerId)
    ),
    media: [],
  };
}