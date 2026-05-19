import "../src/app/api/_bootstrap";
import { fetchPlaybackLogs } from "../src/services/reports/fetchPlaybackLogs";
import { runReportPipeline } from "../src/services/reports/runReportPipeline";
import { generateReportPdf } from "../src/services/reports/generateReportPdf";

(async () => {
  const logs = await fetchPlaybackLogs(
    "2026-01-01T00:00:00-03:00",
    "2026-02-01T00:00:00-03:00"
  );

  const { report, hash, evidence } = await runReportPipeline({
    logs,
    periodStart: "2026-01-01T00:00:00-03:00",
    periodEnd: "2026-02-01T00:00:00-03:00",
  });

  const pdf = await generateReportPdf({
    report,
    hash,
    reportEvidenceId: evidence.id,
  });

  console.log("PDF gerado:", pdf.pdfUrl);
})();