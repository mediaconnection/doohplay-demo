// scripts/test-run-report-pipeline.ts

import "../src/app/api/_bootstrap";
import { runReportPipeline } from "../src/services/reports/runReportPipeline";

(async () => {
  const logs = [
    {
      player_id: "player-1",
      duration_seconds: 10,
      started_at: "2026-01-10T10:00:00-03:00",
    },
  ];

  const result = await runReportPipeline({
    logs,
    periodStart: "2026-01-01T00:00:00-03:00",
    periodEnd: "2026-02-01T00:00:00-03:00",
  });

  console.log("Evidence criada:", result.evidence.id);
})();