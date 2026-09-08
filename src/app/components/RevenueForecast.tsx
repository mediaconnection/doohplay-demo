import { useState } from "react";
import { TrendingUp, Target, Zap, DollarSign, Users, ArrowUp, ArrowDown } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  ReferenceLine, ComposedChart, Line
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82",
  warning: "#FFAA00", danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280",
  gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate: (v: string) => void; }

type Scenario = "pessimista" | "base" | "otimista";

const SCENARIO_CONFIG = {
  pessimista: { growth: 0.08, color: T.danger, label: "Pessimista", multiplier: 0.78 },
  base: { growth: 0.14, color: T.primary, label: "Base", multiplier: 1.0 },
  otimista: { growth: 0.22, color: T.success, label: "Otimista", multiplier: 1.28 },
};

const BASE_MRR_START = 312000;

function buildForecast(scenario: Scenario) {
  const cfg = SCENARIO_CONFIG[scenario];
  const months = ["Set'25", "Out'25", "Nov'25", "Dez'25", "Jan'26", "Fev'26", "Mar'26", "Abr'26", "Mai'26", "Jun'26", "Jul'26", "Ago'26"];
  let mrr = BASE_MRR_START;
  return months.map((m, i) => {
    const growth = cfg.growth + (Math.sin(i * 0.8) * 0.03);
    mrr = mrr * (1 + growth / 12);
    return {
      mes: m,
      mrr: Math.round(mrr * cfg.multiplier),
      novo: Math.round(mrr * cfg.multiplier * 0.18),
      expansao: Math.round(mrr * cfg.multiplier * 0.08),
      churn: Math.round(mrr * cfg.multiplier * -0.04),
    };
  });
}

const COHORT_DATA = [
  { cohort: "2024 Q1", m0: 100, m3: 92, m6: 84, m9: 79, m12: 74 },
  { cohort: "2024 Q2", m0: 100, m3: 94, m6: 87, m9: 82, m12: 78 },
  { cohort: "2024 Q3", m0: 100, m3: 95, m6: 89, m9: 84 },
  { cohort: "2024 Q4", m0: 100, m3: 96, m6: 91 },
  { cohort: "2025 Q1", m0: 100, m3: 97 },
  { cohort: "2025 Q2", m0: 100 },
];

const UNIT_ECON = [
  { mes: "Mar'25", cac: 290, ltv: 4820, payback: 7.2 },
  { mes: "Abr'25", cac: 275, ltv: 4960, payback: 6.8 },
  { mes: "Mai'25", cac: 261, ltv: 5110, payback: 6.4 },
  { mes: "Jun'25", cac: 248, ltv: 5220, payback: 6.1 },
  { mes: "Jul'25", cac: 238, ltv: 5380, payback: 5.8 },
  { mes: "Ago'25", cac: 229, ltv: 5520, payback: 5.5 },
];

const fmt = (v: number) => v >= 1000000 ? `R$${(v / 1000000).toFixed(1)}M` : `R$${(v / 1000).toFixed(0)}k`;

export default function RevenueForecast({ onBack }: Props) {
  const [scenario, setScenario] = useState<Scenario>("base");
  const [tab, setTab] = useState<"forecast" | "cohort" | "unit-econ">("forecast");

  const data = buildForecast(scenario);
  const cfg = SCENARIO_CONFIG[scenario];
  const lastMrr = data[data.length - 1].mrr;
  const firstMrr = data[0].mrr;
  const arrFinal = lastMrr * 12;
  const growth = ((lastMrr - firstMrr) / firstMrr * 100).toFixed(0);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif", padding: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: T.card, border: `1px solid ${T.textSub}22`, borderRadius: 8, padding: "6px 14px", color: T.textSub, cursor: "pointer", fontSize: 13 }}>← Voltar</button>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${T.primary}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={20} color={T.primary} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Revenue Forecast</h1>
            <p style={{ fontSize: 13, color: T.textSub, margin: 0 }}>Projeção de receita com IA — próximos 12 meses</p>
          </div>
        </div>

        {/* Scenario selector */}
        <div style={{ display: "flex", gap: 6 }}>
          {(Object.keys(SCENARIO_CONFIG) as Scenario[]).map(s => (
            <button key={s} onClick={() => setScenario(s)} style={{
              padding: "8px 18px", borderRadius: 8, border: `1px solid ${scenario === s ? SCENARIO_CONFIG[s].color : T.textSub + "33"}`,
              background: scenario === s ? `${SCENARIO_CONFIG[s].color}18` : "transparent",
              color: scenario === s ? SCENARIO_CONFIG[s].color : T.textSub,
              cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "capitalize",
            }}>
              {SCENARIO_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "MRR Atual", value: fmt(BASE_MRR_START), sub: "Set/2025", color: T.primary, icon: <DollarSign size={16} color={T.primary} /> },
          { label: "MRR Projetado", value: fmt(lastMrr), sub: "Ago/2026", color: cfg.color, icon: <TrendingUp size={16} color={cfg.color} /> },
          { label: "ARR Projetado", value: fmt(arrFinal), sub: "12 meses", color: T.gold, icon: <Target size={16} color={T.gold} /> },
          { label: "Crescimento MRR", value: `+${growth}%`, sub: "12 meses", color: T.success, icon: <ArrowUp size={16} color={T.success} /> },
          { label: "NRR Estimado", value: scenario === "otimista" ? "134%" : scenario === "base" ? "128%" : "112%", sub: "Net Revenue Retention", color: T.accent, icon: <Users size={16} color={T.accent} /> },
        ].map(k => (
          <div key={k.label} style={{ background: T.panel, borderRadius: 12, padding: "16px 18px", border: `1px solid ${k.color}22` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <p style={{ fontSize: 11, color: T.textSub, margin: "0 0 6px" }}>{k.label}</p>
              {k.icon}
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, margin: 0, color: k.color }}>{k.value}</p>
            <p style={{ fontSize: 11, color: T.textSub, margin: "4px 0 0" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 22, background: T.card, borderRadius: 10, padding: 4, width: "fit-content" }}>
        {(["forecast", "cohort", "unit-econ"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
            background: tab === t ? T.panel : "transparent",
            color: tab === t ? T.text : T.textSub,
          }}>
            {{ forecast: "Projeção MRR", cohort: "Análise de Coorte", "unit-econ": "Economia Unitária" }[t]}
          </button>
        ))}
      </div>

      {tab === "forecast" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Main forecast chart */}
          <div style={{ background: T.panel, borderRadius: 12, padding: 24, border: `1px solid ${cfg.color}22` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>MRR — Cenário {cfg.label}</h3>
              <div style={{ display: "flex", gap: 8, fontSize: 12, color: T.textSub }}>
                <span style={{ color: cfg.color, fontWeight: 600 }}>●</span> MRR
                <span style={{ color: T.success, fontWeight: 600 }}>●</span> Expansão
                <span style={{ color: T.warning, fontWeight: 600 }}>●</span> Novo
                <span style={{ color: T.danger, fontWeight: 600 }}>●</span> Churn
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cfg.color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={cfg.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="mes" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: T.card, border: `1px solid ${T.textSub}33`, borderRadius: 8, color: T.text, fontSize: 12 }}
                  formatter={(v: any, name: any) => [fmt(Math.abs(v)), name]}
                />
                <ReferenceLine y={BASE_MRR_START} stroke={T.textSub} strokeDasharray="4 4" />
                <Area type="monotone" dataKey="mrr" stroke={cfg.color} fill="url(#gMrr)" strokeWidth={2.5} name="MRR" />
                <Bar dataKey="novo" fill={T.warning} name="Novo MRR" opacity={0.7} radius={[2, 2, 0, 0]} />
                <Bar dataKey="expansao" fill={T.success} name="Expansão" opacity={0.7} radius={[2, 2, 0, 0]} />
                <Bar dataKey="churn" fill={T.danger} name="Churn" opacity={0.7} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Three scenarios comparison */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {(Object.keys(SCENARIO_CONFIG) as Scenario[]).map(s => {
              const d = buildForecast(s);
              const last = d[d.length - 1].mrr;
              const c = SCENARIO_CONFIG[s];
              return (
                <div key={s} onClick={() => setScenario(s)} style={{ background: T.panel, borderRadius: 12, padding: 18, border: `1px solid ${scenario === s ? c.color : T.textSub + "22"}`, cursor: "pointer", transition: "border-color 0.2s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: c.color }}>{c.label}</span>
                    <span style={{ fontSize: 11, color: T.textSub }}>CAGR {(c.growth * 100).toFixed(0)}%/mês</span>
                  </div>
                  <p style={{ fontSize: 24, fontWeight: 800, color: c.color, margin: "0 0 4px" }}>{fmt(last * 12)}</p>
                  <p style={{ fontSize: 12, color: T.textSub, margin: 0 }}>ARR em Ago/2026</p>
                  <div style={{ marginTop: 12, height: 3, background: `${T.textSub}22`, borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${(last / buildForecast("otimista")[11].mrr) * 100}%`, background: c.color, borderRadius: 2 }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI insight */}
          <div style={{ background: `${T.accent}11`, borderRadius: 12, padding: 20, border: `1px solid ${T.accent}33`, display: "flex", gap: 14 }}>
            <div style={{ background: `${T.accent}22`, padding: 8, borderRadius: 8, height: "fit-content" }}>
              <Zap size={18} color={T.accent} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: T.accent }}>Insight de IA</p>
              <p style={{ fontSize: 13, color: T.textSub, margin: 0, lineHeight: 1.6 }}>
                Com base na tendência de crescimento dos últimos 6 meses (+14.2% MoM) e pipeline de parceiros confirmados (R$ 890k em contratos),
                o cenário <strong style={{ color: T.text }}>Base</strong> tem 72% de probabilidade de realização.
                O principal vetor de crescimento identificado é expansão em cidades tier-2 (Campinas, Ribeirão, Floripa) com potencial adicional de
                <strong style={{ color: T.success }}> R$ 180k MRR</strong> até Q1/2026.
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === "cohort" && (
        <div style={{ background: T.panel, borderRadius: 12, padding: 24, border: `1px solid ${T.textSub}18` }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 20px" }}>Retenção de Receita por Coorte (%)</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px 16px", color: T.textSub, fontWeight: 500 }}>Coorte</th>
                  {["Mês 0", "Mês 3", "Mês 6", "Mês 9", "Mês 12"].map(h => (
                    <th key={h} style={{ textAlign: "center", padding: "8px 16px", color: T.textSub, fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COHORT_DATA.map((row, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${T.textSub}22` }}>
                    <td style={{ padding: "10px 16px", fontWeight: 600 }}>{row.cohort}</td>
                    {[row.m0, row.m3, row.m6, row.m9, row.m12].map((v, j) => {
                      const pct = v ?? null;
                      const bg = pct !== null ? (pct >= 90 ? T.success : pct >= 80 ? T.warning : T.danger) : "transparent";
                      return (
                        <td key={j} style={{ textAlign: "center", padding: "10px 16px" }}>
                          {pct !== null ? (
                            <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, background: `${bg}22`, color: bg, fontWeight: 600, fontSize: 13 }}>
                              {pct}%
                            </span>
                          ) : <span style={{ color: T.textSub }}>—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
            {[{ label: "≥ 90% — Excelente", color: T.success }, { label: "80–89% — Bom", color: T.warning }, { label: "< 80% — Atenção", color: T.danger }].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                <span style={{ fontSize: 11, color: T.textSub }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "unit-econ" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>CAC vs LTV (R$)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={UNIT_ECON} margin={{ left: 0, right: 4 }}>
                <XAxis dataKey="mes" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
                <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.textSub}33`, borderRadius: 8, color: T.text, fontSize: 12 }} formatter={(v: any) => [`R$ ${v}`]} />
                <Bar yAxisId="left" dataKey="cac" fill={T.danger} name="CAC" opacity={0.8} radius={[3, 3, 0, 0]} />
                <Line yAxisId="left" type="monotone" dataKey="ltv" stroke={T.success} strokeWidth={2.5} dot={{ r: 4, fill: T.success }} name="LTV" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "CAC Atual", value: "R$ 229", trend: -21, color: T.success },
              { label: "LTV Atual", value: "R$ 5.520", trend: +14.5, color: T.success },
              { label: "LTV / CAC", value: "24.1×", trend: +8.2, color: T.gold },
              { label: "Payback Period", value: "5.5 meses", trend: -24, color: T.success },
            ].map(k => (
              <div key={k.label} style={{ background: T.panel, borderRadius: 10, padding: 16, border: `1px solid ${k.color}22`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 12, color: T.textSub, margin: 0 }}>{k.label}</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: k.color, margin: "4px 0 0" }}>{k.value}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: k.trend > 0 ? T.success : T.success, fontSize: 12, fontWeight: 600 }}>
                  {k.trend > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  {Math.abs(k.trend)}% 6m
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
