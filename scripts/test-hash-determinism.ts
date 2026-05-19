// scripts/test-hash-determinism.ts

import { generateConsolidatedReport } from "../src/services/reports/generateConsolidatedReport";
import { getHashableReport } from "../src/lib/getHashableReport";
import { sha256FromObject } from "../src/lib/hash";

const params = {
  logs: [
    {
      player_id: "player-1",
      duration_seconds: 10,
      started_at: "2026-01-10T10:00:00-03:00",
    },
    {
      player_id: "player-1",
      duration_seconds: 5,
      started_at: "2026-01-10T10:05:00-03:00",
    },
  ],
  periodStart: "2026-01-01T00:00:00-03:00",
  periodEnd: "2026-02-01T00:00:00-03:00",
};

const r1 = generateConsolidatedReport(params);
const r2 = generateConsolidatedReport(params);

const h1 = sha256FromObject(getHashableReport(r1));
const h2 = sha256FromObject(getHashableReport(r2));

if (h1 !== h2) {
  throw new Error("HASH QUEBROU ❌");
}

console.log("Hash determinístico ✅");