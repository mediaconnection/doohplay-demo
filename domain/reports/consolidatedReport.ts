export interface ConsolidatedReport {
  version: "1.0";
  platform: "DOOHPLAY";

  period: {
    start: string; // ISO
    end: string;   // ISO
    timezone: string;
  };

  generatedAt: string; // ISO (informativo)

  summary: {
    totalPlayers: number;
    totalPlays: number;
    totalDurationSeconds: number;
  };

  players: Array<{
    playerId: string;
    location?: string;
    plays: number;
    durationSeconds: number;
  }>;

  media: Array<{
    mediaId: string;
    plays: number;
    durationSeconds: number;
  }>;
}