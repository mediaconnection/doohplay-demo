import { useState, useMemo, Fragment } from "react";
import { Map, Target, Users, DollarSign, BarChart2, Download, Plus, Trash2, Eye } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82",
  warning: "#FFAA00", danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280",
  gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate: (v: string) => void; }

interface CityAlloc { city: string; budget: number; enabled: boolean; screens: number; reach: number; }
interface FormatMix { format: string; pct: number; cpm: number; color: string; }

const CITIES_BASE: CityAlloc[] = [
  { city: "São Paulo", budget: 18000, enabled: true, screens: 412, reach: 2800000 },
  { city: "Rio de Janeiro", budget: 12000, enabled: true, screens: 287, reach: 1940000 },
  { city: "Brasília", budget: 7000, enabled: true, screens: 156, reach: 890000 },
  { city: "Belo Horizonte", budget: 6000, enabled: false, screens: 143, reach: 820000 },
  { city: "Curitiba", budget: 5000, enabled: false, screens: 118, reach: 740000 },
  { city: "Porto Alegre", budget: 4000, enabled: false, screens: 98, reach: 620000 },
  { city: "Salvador", budget: 4000, enabled: false, screens: 87, reach: 590000 },
  { city: "Fortaleza", budget: 3500, enabled: false, screens: 76, reach: 510000 },
];

const FORMATS_BASE: FormatMix[] = [
  { format: "Billboard", pct: 35, cpm: 38, color: T.primary },
  { format: "Transit Media", pct: 25, cpm: 24, color: T.accent },
  { format: "Retail Indoor", pct: 20, cpm: 19, color: T.success },
  { format: "Smart City", pct: 12, cpm: 28, color: T.warning },
  { format: "Shopping", pct: 8, cpm: 32, color: "#FF6B9D" },
];

const DAYPARTS = [
  { slot: "00–06h", label: "Madrugada", checked: false, mult: 0.3 },
  { slot: "06–09h", label: "Manhã Cedo", checked: true, mult: 1.4 },
  { slot: "09–12h", label: "Manhã", checked: true, mult: 1.1 },
  { slot: "12–14h", label: "Almoço", checked: true, mult: 1.6 },
  { slot: "14–17h", label: "Tarde", checked: true, mult: 1.0 },
  { slot: "17–20h", label: "Rush", checked: true, mult: 1.8 },
  { slot: "20–23h", label: "Noite", checked: true, mult: 1.3 },
  { slot: "23–00h", label: "Late Night", checked: false, mult: 0.5 },
];

const BRAZIL_POSITIONS: Record<string, { x: number; y: number }> = {
  "São Paulo": { x: 58, y: 73 },
  "Rio de Janeiro": { x: 63, y: 68 },
  "Brasília": { x: 54, y: 50 },
  "Belo Horizonte": { x: 60, y: 61 },
  "Curitiba": { x: 55, y: 80 },
  "Porto Alegre": { x: 50, y: 89 },
  "Salvador": { x: 72, y: 45 },
  "Fortaleza": { x: 72, y: 26 },
};

export default function OOHPlanner({ onBack }: Props) {
  const [cities, setCities] = useState<CityAlloc[]>(CITIES_BASE);
  const [formats, setFormats] = useState<FormatMix[]>(FORMATS_BASE);
  const [dayparts, setDayparts] = useState(DAYPARTS);
  const [tab, setTab] = useState<"plan" | "reach" | "schedule" | "summary">("plan");
  const [flightStart, setFlightStart] = useState("2025-10-01");
  const [flightEnd, setFlightEnd] = useState("2025-10-31");

  const activeCities = cities.filter(c => c.enabled);
  const totalBudget = cities.filter(c => c.enabled).reduce((s, c) => s + c.budget, 0);
  const totalReach = activeCities.reduce((s, c) => s + c.reach, 0);
  const totalScreens = activeCities.reduce((s, c) => s + c.screens, 0);
  const activeSlots = dayparts.filter(d => d.checked).length;
  const avgCPM = Math.round(formats.reduce((s, f) => s + f.cpm * f.pct / 100, 0));
  const totalImpressions = Math.round((totalBudget / avgCPM) * 1000);
  const estimatedGRP = Math.round((totalImpressions / totalReach) * 100 * activeSlots / 8);
  const frequency = Math.round(estimatedGRP / 100 * 3.2 * 10) / 10;

  const pieData = formats.map(f => ({ name: f.format, value: f.pct, color: f.color }));

  const reachByCity = activeCities.map(c => ({
    city: c.city.split(" ")[0],
    reach: Math.round(c.reach / 1000),
    impressions: Math.round((c.budget / avgCPM) * 1000 / 1000),
  }));

  const radarData = [
    { metric: "Alcance", A: Math.min(100, Math.round(totalReach / 100000)) },
    { metric: "Frequência", A: Math.min(100, Math.round(frequency * 8)) },
    { metric: "Cobertura", A: activeCities.length * 12 },
    { metric: "Formatos", A: Math.round((formats.reduce((s, f) => s + (f.pct > 0 ? 1 : 0), 0) / formats.length) * 100) },
    { metric: "Horários", A: Math.round((activeSlots / dayparts.length) * 100) },
    { metric: "Budget", A: Math.min(100, Math.round(totalBudget / 1000)) },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif", padding: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: T.card, border: `1px solid ${T.textSub}22`, borderRadius: 8, padding: "6px 14px", color: T.textSub, cursor: "pointer", fontSize: 13 }}>← Voltar</button>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${T.warning}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Map size={20} color={T.warning} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>OOH Planner</h1>
            <p style={{ fontSize: 13, color: T.textSub, margin: 0 }}>Planejamento de campanha DOOH por cidade e formato</p>
          </div>
        </div>
        <button style={{ background: T.success, color: "#000", border: "none", borderRadius: 8, padding: "9px 20px", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          <Download size={14} /> Exportar Plano
        </button>
      </div>

      {/* Summary bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Budget Total", value: `R$ ${(totalBudget / 1000).toFixed(0)}k`, color: T.gold },
          { label: "Impressões Est.", value: `${(totalImpressions / 1000).toFixed(0)}k`, color: T.primary },
          { label: "Alcance", value: `${(totalReach / 1000000).toFixed(1)}M`, color: T.success },
          { label: "Frequência", value: `${frequency}×`, color: T.accent },
          { label: "GRP", value: `${estimatedGRP}`, color: T.warning },
        ].map(k => (
          <div key={k.label} style={{ background: T.panel, borderRadius: 10, padding: "14px 16px", border: `1px solid ${k.color}22`, textAlign: "center" }}>
            <p style={{ fontSize: 11, color: T.textSub, margin: "0 0 4px" }}>{k.label}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 22, background: T.card, borderRadius: 10, padding: 4, width: "fit-content" }}>
        {(["plan", "reach", "schedule", "summary"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
            background: tab === t ? T.panel : "transparent",
            color: tab === t ? T.text : T.textSub,
          }}>
            {{ plan: "Cidades & Orçamento", reach: "Alcance & Mix", schedule: "Dayparting", summary: "Resumo Executivo" }[t]}
          </button>
        ))}
      </div>

      {tab === "plan" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
          {/* City allocation */}
          <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Alocação por Cidade</h3>
              <span style={{ fontSize: 12, color: T.textSub }}>{activeCities.length} cidades ativas</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cities.map((c, i) => (
                <div key={c.city} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: c.enabled ? T.card : "transparent", border: `1px solid ${c.enabled ? T.primary + "33" : T.textSub + "18"}`, transition: "all 0.2s" }}>
                  <input type="checkbox" checked={c.enabled} onChange={e => setCities(prev => prev.map((x, j) => j === i ? { ...x, enabled: e.target.checked } : x))}
                    style={{ accentColor: T.primary, width: 16, height: 16, cursor: "pointer" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: c.enabled ? T.text : T.textSub }}>{c.city}</span>
                      <div style={{ display: "flex", gap: 10, fontSize: 11, color: T.textSub }}>
                        <span>{c.screens} telas</span>
                        <span>{(c.reach / 1000000).toFixed(1)}M alcance</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input type="range" min={1000} max={30000} step={500} value={c.budget}
                        onChange={e => setCities(prev => prev.map((x, j) => j === i ? { ...x, budget: Number(e.target.value) } : x))}
                        disabled={!c.enabled}
                        style={{ flex: 1, accentColor: T.primary, cursor: c.enabled ? "pointer" : "not-allowed", opacity: c.enabled ? 1 : 0.4 }} />
                      <span style={{ minWidth: 64, textAlign: "right", fontWeight: 700, color: c.enabled ? T.gold : T.textSub, fontSize: 13 }}>
                        R$ {(c.budget / 1000).toFixed(1)}k
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Brazil map */}
          <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>Cobertura Geográfica</h3>
            <svg viewBox="0 0 100 110" style={{ width: "100%", height: 320 }}>
              <path d="M40,5 L55,8 L65,5 L75,12 L80,20 L85,28 L82,36 L78,42 L80,50 L75,58 L72,65 L74,72 L70,78 L65,82 L58,84 L52,88 L48,94 L44,90 L40,84 L36,80 L32,78 L28,72 L24,66 L22,58 L18,50 L16,42 L20,34 L22,26 L26,18 L32,12 Z"
                fill={`${T.primary}11`} stroke={`${T.textSub}44`} strokeWidth={0.5} />
              {cities.map(c => {
                const pos = BRAZIL_POSITIONS[c.city];
                if (!pos) return null;
                const r = c.enabled ? 3 + (c.budget / 10000) * 2 : 2;
                return (
                  <g key={c.city}>
                    {c.enabled && <circle cx={pos.x} cy={pos.y} r={r + 4} fill={T.primary} opacity={0.12} />}
                    <circle cx={pos.x} cy={pos.y} r={r} fill={c.enabled ? T.primary : T.textSub} opacity={c.enabled ? 0.9 : 0.4} />
                    <text x={pos.x} y={pos.y - r - 2} textAnchor="middle" fontSize={3.5} fill={c.enabled ? T.text : T.textSub} fontWeight={600}>{c.city.split(" ")[0]}</text>
                  </g>
                );
              })}
            </svg>
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.textSub }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.primary }} />
                <span>Cidade ativa — tamanho = budget</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.textSub, marginTop: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.textSub, opacity: 0.4 }} />
                <span>Cidade inativa</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "reach" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Reach by city */}
          <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>Alcance e Impressões por Cidade (mil)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={reachByCity} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="city" tick={{ fill: T.text, fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.textSub}33`, borderRadius: 8, color: T.text, fontSize: 12 }} formatter={(v: any, n: any) => [`${v}k`, n === "reach" ? "Alcance" : "Impressões"]} />
                <Bar key="bar-reach" dataKey="reach" fill={T.primary} name="reach" radius={[0, 4, 4, 0]} opacity={0.7} />
                <Bar key="bar-impressions" dataKey="impressions" fill={T.success} name="impressions" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Format mix + radar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>Mix de Formatos (%)</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value">
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  {formats.map((f, i) => (
                    <div key={f.format} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: f.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: T.textSub, flex: 1 }}>{f.format}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <input type="range" min={0} max={60} value={f.pct}
                          onChange={e => setFormats(prev => prev.map((x, j) => j === i ? { ...x, pct: Number(e.target.value) } : x))}
                          style={{ width: 60, accentColor: f.color }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: f.color, minWidth: 28 }}>{f.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ background: T.panel, borderRadius: 12, padding: 16, border: `1px solid ${T.textSub}18` }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 10px" }}>Score do Plano</h3>
              <ResponsiveContainer width="100%" height={160}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={60}>
                  <PolarGrid stroke={`${T.textSub}33`} />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: T.textSub, fontSize: 9 }} />
                  <Radar name="Plano" dataKey="A" stroke={T.warning} fill={T.warning} fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === "schedule" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>Período de Veiculação</h3>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: T.textSub, display: "block", marginBottom: 6 }}>Início</label>
                  <input type="date" value={flightStart} onChange={e => setFlightStart(e.target.value)}
                    style={{ width: "100%", background: T.card, border: `1px solid ${T.textSub}44`, borderRadius: 8, padding: "8px 12px", color: T.text, fontSize: 13 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: T.textSub, display: "block", marginBottom: 6 }}>Fim</label>
                  <input type="date" value={flightEnd} onChange={e => setFlightEnd(e.target.value)}
                    style={{ width: "100%", background: T.card, border: `1px solid ${T.textSub}44`, borderRadius: 8, padding: "8px 12px", color: T.text, fontSize: 13 }} />
                </div>
              </div>
              <div style={{ marginTop: 14, padding: 12, background: T.card, borderRadius: 8 }}>
                <p style={{ fontSize: 12, color: T.textSub, margin: "0 0 4px" }}>Duração da campanha</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: T.gold, margin: 0 }}>
                  {Math.round((new Date(flightEnd).getTime() - new Date(flightStart).getTime()) / 86400000)} dias
                </p>
              </div>
            </div>

            <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>Dayparting</h3>
              <p style={{ fontSize: 12, color: T.textSub, margin: "0 0 14px" }}>{activeSlots} horários selecionados</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {dayparts.map((d, i) => (
                  <div key={d.slot} onClick={() => setDayparts(prev => prev.map((x, j) => j === i ? { ...x, checked: !x.checked } : x))}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, cursor: "pointer", background: d.checked ? `${T.primary}18` : T.card, border: `1px solid ${d.checked ? T.primary + "44" : T.textSub + "22"}`, transition: "all 0.15s" }}>
                    <div style={{ width: 14, height: 14, borderRadius: 4, background: d.checked ? T.primary : "transparent", border: `2px solid ${d.checked ? T.primary : T.textSub}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {d.checked && <div style={{ width: 6, height: 6, borderRadius: 2, background: "#fff" }} />}
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, margin: 0, color: d.checked ? T.text : T.textSub }}>{d.label}</p>
                      <p style={{ fontSize: 10, margin: 0, color: T.textSub }}>{d.slot} · {d.mult}× CPM</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly reach heatmap */}
          <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>Distribuição de Impressões por Dia/Horário</h3>
            <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", gap: 3 }}>
              <div />
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: 11, color: T.textSub, paddingBottom: 6 }}>{d}</div>
              ))}
              {dayparts.map((dp, i) => (
                <Fragment key={dp.slot}>
                  <div style={{ fontSize: 10, color: T.textSub, paddingRight: 8, lineHeight: "24px", textAlign: "right" }}>{dp.slot.split("–")[0]}</div>
                  {[0, 1, 2, 3, 4, 5, 6].map(d => {
                    const isWeekend = d >= 5;
                    const intensity = dp.checked ? dp.mult * (isWeekend ? 1.3 : 1) : 0;
                    const alpha = Math.min(0.9, intensity * 0.4);
                    return (
                      <div key={dp.slot + d} style={{ height: 24, borderRadius: 4, background: dp.checked ? `rgba(79,110,247,${alpha})` : `${T.textSub}18` }} />
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "summary" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: `${T.primary}11`, borderRadius: 12, padding: 24, border: `1px solid ${T.primary}33` }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Resumo Executivo do Plano</h2>
            <p style={{ fontSize: 13, color: T.textSub, margin: 0 }}>
              Campanha DOOH multi-cidade · {flightStart} a {flightEnd} · {activeCities.length} mercados
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { label: "Investimento Total", value: `R$ ${(totalBudget / 1000).toFixed(1)}k`, sub: `${activeCities.length} cidades`, color: T.gold },
              { label: "Impressões Projetadas", value: `${(totalImpressions / 1000).toFixed(0)}k`, sub: `CPM médio R$ ${avgCPM}`, color: T.primary },
              { label: "Alcance Único", value: `${(totalReach / 1000000).toFixed(1)}M pessoas`, sub: "estimativa 4 semanas", color: T.success },
              { label: "Frequência", value: `${frequency}× média`, sub: "contatos por pessoa", color: T.accent },
              { label: "GRP Total", value: `${estimatedGRP} GRPs`, sub: "gross rating points", color: T.warning },
              { label: "Telas Contratadas", value: `${totalScreens}`, sub: `${activeCities.length} cidades ativas`, color: T.text },
            ].map(k => (
              <div key={k.label} style={{ background: T.panel, borderRadius: 12, padding: 18, border: `1px solid ${k.color}22` }}>
                <p style={{ fontSize: 11, color: T.textSub, margin: "0 0 6px" }}>{k.label}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
                <p style={{ fontSize: 11, color: T.textSub, margin: "4px 0 0" }}>{k.sub}</p>
              </div>
            ))}
          </div>
          <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 14px" }}>Detalhamento por Cidade</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Cidade", "Budget", "Telas", "Impressões", "Alcance", "CPM", "Share"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 14px", color: T.textSub, fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeCities.map(c => (
                  <tr key={c.city} style={{ borderTop: `1px solid ${T.textSub}18` }}>
                    <td style={{ padding: "10px 14px", fontWeight: 600 }}>{c.city}</td>
                    <td style={{ padding: "10px 14px", color: T.gold }}>R$ {(c.budget / 1000).toFixed(1)}k</td>
                    <td style={{ padding: "10px 14px", color: T.textSub }}>{c.screens}</td>
                    <td style={{ padding: "10px 14px" }}>{Math.round((c.budget / avgCPM) * 1000 / 1000)}k</td>
                    <td style={{ padding: "10px 14px", color: T.success }}>{(c.reach / 1000000).toFixed(1)}M</td>
                    <td style={{ padding: "10px 14px" }}>R$ {avgCPM}</td>
                    <td style={{ padding: "10px 14px", color: T.primary }}>{Math.round((c.budget / totalBudget) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button style={{ background: T.primary, color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", cursor: "pointer", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <Plus size={16} /> Criar Campanha com este Plano
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
