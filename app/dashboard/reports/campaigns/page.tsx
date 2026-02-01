import { Pool } from "pg";

/* ---------- Tipos ---------- */

type CampaignOption = {
  id: string;
  name: string;
};

type CampaignReportRow = {
  campaign_id: string;
  campaign_name: string;
  executions_done: string;
  total_seconds: string;
  cpm: string;
  gross_amount: string;
};

type CampaignReport = {
  campaign_id: string;
  campaign_name: string;
  executions_done: number;
  total_seconds: number;
  cpm: number;
  gross_amount: number;
};

/* ---------- Pool singleton ---------- */

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

const pool =
  global.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  global.pgPool = pool;
}

/* ---------- Período ---------- */

function resolvePeriod(period?: string) {
  const end = new Date();
  const start = new Date(end);

  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "7d":
      start.setDate(end.getDate() - 7);
      break;
    case "30d":
    default:
      start.setDate(end.getDate() - 30);
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/* ---------- Queries ---------- */

async function getCampaignOptions(): Promise<CampaignOption[]> {
  const { rows } = await pool.query<CampaignOption>(`
    SELECT id, name
    FROM public.campaigns
    ORDER BY name;
  `);

  return rows;
}

async function getCampaignReports(
  period?: string,
  campaignId?: string
): Promise<CampaignReport[]> {
  const { start, end } = resolvePeriod(period);

  const query = `
    SELECT
      c.id AS campaign_id,
      c.name AS campaign_name,
      COUNT(pl.id) AS executions_done,
      COALESCE(SUM(pl.duration_seconds), 0) AS total_seconds,
      25.00::numeric AS cpm,
      ROUND((COUNT(pl.id)::numeric / 1000) * 25.00, 2) AS gross_amount
    FROM public.campaigns c
    LEFT JOIN public.play_logs_certified pl
      ON pl.campaign_id = c.id
     AND pl.created_at >= $1
     AND pl.created_at <  $2
    WHERE ($3::uuid IS NULL OR c.id = $3::uuid)
    GROUP BY c.id, c.name
    ORDER BY c.name;
  `;

  const params = [start, end, campaignId ?? null];

  const { rows } = await pool.query<CampaignReportRow>(query, params);

  return rows.map((r) => ({
    campaign_id: r.campaign_id,
    campaign_name: r.campaign_name,
    executions_done: Number(r.executions_done),
    total_seconds: Number(r.total_seconds),
    cpm: Number(r.cpm),
    gross_amount: Number(r.gross_amount),
  }));
}

/* ---------- Página ---------- */

export default async function CampaignReportsPage({
  searchParams,
}: {
  searchParams: { period?: string; campaign?: string };
}) {
  const campaigns = await getCampaignOptions();
  const data = await getCampaignReports(
    searchParams.period,
    searchParams.campaign
  );

  const totalExecutions = data.reduce((s, c) => s + c.executions_done, 0);
  const totalSeconds = data.reduce((s, c) => s + c.total_seconds, 0);
  const totalGross = data.reduce((s, c) => s + c.gross_amount, 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">📊 Relatório de Campanhas</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <FilterButton label="Hoje" period="today" campaign={searchParams.campaign} />
        <FilterButton label="7 dias" period="7d" campaign={searchParams.campaign} />
        <FilterButton label="30 dias" period="30d" campaign={searchParams.campaign} />

        <form method="GET" className="flex gap-2">
          <input type="hidden" name="period" value={searchParams.period ?? ""} />

          <select
            name="campaign"
            defaultValue={searchParams.campaign ?? ""}
            className="border rounded-md px-2 py-1 text-sm"
          >
            <option value="">Todas as campanhas</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
          >
            Filtrar
          </button>
        </form>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi title="Execuções" value={totalExecutions} />
        <Kpi title="Tempo (s)" value={totalSeconds} />
        <Kpi title="Valor (R$)" value={totalGross.toFixed(2)} />
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Campanha</th>
              <th className="text-right p-3">Execuções</th>
              <th className="text-right p-3">Tempo (s)</th>
              <th className="text-right p-3">Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.campaign_id} className="border-t">
                <td className="p-3">{row.campaign_name}</td>
                <td className="p-3 text-right">{row.executions_done}</td>
                <td className="p-3 text-right">{row.total_seconds}</td>
                <td className="p-3 text-right">
                  {row.gross_amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Componentes ---------- */

function Kpi({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-black text-white rounded-lg p-4">
      <div className="text-sm opacity-80">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function FilterButton({
  label,
  period,
  campaign,
}: {
  label: string;
  period: string;
  campaign?: string;
}) {
  const params = new URLSearchParams();
  params.set("period", period);
  if (campaign) params.set("campaign", campaign);

  return (
    <a
      href={`?${params.toString()}`}
      className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
    >
      {label}
    </a>
  );
}
