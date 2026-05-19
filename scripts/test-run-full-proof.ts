await runFullProofPipeline({
  logs,
  periodStart: "2026-01-01T00:00:00Z",
  periodEnd: "2026-01-31T23:59:59Z",
  otsFilePath: "./root.hash.ots",
});