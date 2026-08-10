import { useState } from "react";
import { Leaf, Download, Award, Zap, TrendingDown, Globe, CheckCircle, Target, BarChart2 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82",
  warning: "#FFAA00", danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280",
  green: "#00DC82", teal: "#00C9B1",
};

interface Props { onBack: () => void; onNavigate: (v: string) => void; }

const MONTHLY_CO2 = [
  { mes: "Jan", dooh: 4.2, tradicional: 18.7 },
  { mes: "Fev", dooh: 3.9, tradicional: 18.7 },
  { mes: "Mar", dooh: 3.5, tradicional: 17.9 },
  { mes: "Abr", dooh: 3.1, tradicional: 17.9 },
  { mes: "Mai", dooh: 2.8, tradicional: 16.4 },
  { mes: "Jun", dooh: 2.4, tradicional: 16.4 },
  { mes: "Jul", dooh: 2.1, tradicional: 15.8 },
  { mes: "Ago", dooh: 1.9, tradicional: 15.8 },
];

const ENERGY_MIX = [
  { name: "Solar", value: 41, color: "#FFAA00" },
  { name: "Eólica", value: 28, color: "#00C9B1" },
  { name: "Hidrelétrica", value: 22, color: "#4F6EF7" },
  { name: "Rede convencional", value: 9, color: "#4A5280" },
];

const SCOPE_DATA = [
  { scope: "Escopo 1", ton: 12.4, label: "Emissões diretas" },
  { scope: "Escopo 2", ton: 38.7, label: "Energia elétrica" },
  { scope: "Escopo 3", ton: 74.2, label: "Cadeia de valor" },
];

const RADAR_DATA = [
  { metric: "Carbono", A: 82 },
  { metric: "Energia", A: 91 },
  { metric: "Resíduos", A: 67 },
  { metric: "Água", A: 74 },
  { metric: "Social", A: 88 },
  { metric: "Gov.", A: 95 },
];

const CERTS = [
  { name: "REC — I-REC Standard", issued: "Jan 2025", valid: "Dez 2025", mwh: 1240, status: "active" },
  { name: "LEED Silver — Sede SP", issued: "Mar 2024", valid: "Mar 2027", mwh: null, status: "active" },
  { name: "ISO 14001:2015", issued: "Jun 2024", valid: "Jun 2027", mwh: null, status: "active" },
  { name: "Carbon Neutral Verified", issued: "Ago 2025", valid: "Ago 2026", mwh: null, status: "pending" },
];

const GOALS = [
  { label: "Redução de emissões (vs 2023)", current: 68, target: 100, unit: "%" },
  { label: "Energia renovável", current: 91, target: 100, unit: "%" },
  { label: "Telas certificadas verdes", current: 74, target: 90, unit: "%" },
  { label: "Fornecedores com ESG score", current: 52, target: 80, unit: "%" },
];

const ESG_TIER = { label: "Gold", score: 87, color: "#FFD700" };

export default function ESGDashboard({ onBack }: Props) {
  const [tab, setTab] = useState<"overview" | "emissions" | "energy" | "certificates">("overview");

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif", padding: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: T.card, border: `1px solid ${T.textSub}22`, borderRadius: 8, padding: "6px 14px", color: T.textSub, cursor: "pointer", fontSize: 13 }}>← Voltar</button>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${T.green}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Leaf size={20} color={T.green} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>ESG Dashboard</h1>
            <p style={{ fontSize: 13, color: T.textSub, margin: 0 }}>Sustentabilidade & Responsabilidade Corporativa</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ background: `${ESG_TIER.color}22`, border: `1px solid ${ESG_TIER.color}44`, borderRadius: 8, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <Award size={16} color={ESG_TIER.color} />
            <span style={{ fontSize: 14, fontWeight: 700, color: ESG_TIER.color }}>ESG {ESG_TIER.label}</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: ESG_TIER.color }}>{ESG_TIER.score}</span>
          </div>
          <button style={{ background: T.green, color: "#000", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <Download size={14} /> Relatório ESG
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 28, background: T.card, borderRadius: 10, padding: 4, width: "fit-content" }}>
        {(["overview", "emissions", "energy", "certificates"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
            background: tab === t ? T.panel : "transparent",
            color: tab === t ? T.text : T.textSub,
            textTransform: "capitalize",
          }}>
            {{ overview: "Visão Geral", emissions: "Emissões", energy: "Energia", certificates: "Certificados" }[t]}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { label: "CO₂ poupado (ton)", value: "1.847", sub: "vs mídia tradicional", icon: <Leaf size={18} color={T.green} />, color: T.green },
              { label: "Energia renovável", value: "91%", sub: "+8pp vs ano anterior", icon: <Zap size={18} color={T.warning} />, color: T.warning },
              { label: "Emissões totais (ton)", value: "125.3", sub: "↓ 32% vs 2023", icon: <TrendingDown size={18} color={T.teal} />, color: T.teal },
              { label: "Telas certificadas", value: "847", sub: "de 1.142 total", icon: <CheckCircle size={18} color={T.primary} />, color: T.primary },
            ].map(k => (
              <div key={k.label} style={{ background: T.panel, borderRadius: 12, padding: "20px 22px", border: `1px solid ${k.color}22` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: 12, color: T.textSub, margin: "0 0 6px" }}>{k.label}</p>
                    <p style={{ fontSize: 26, fontWeight: 800, margin: 0, color: k.color }}>{k.value}</p>
                    <p style={{ fontSize: 11, color: T.textSub, margin: "4px 0 0" }}>{k.sub}</p>
                  </div>
                  <div style={{ background: `${k.color}18`, padding: 8, borderRadius: 8 }}>{k.icon}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
            <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px", color: T.text }}>CO₂ por Mil Impressões (g)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={MONTHLY_CO2} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gTradicional" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={T.danger} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={T.danger} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gDooh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={T.green} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={T.green} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="mes" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.textSub}33`, borderRadius: 8, color: T.text, fontSize: 12 }} />
                  <Area type="monotone" dataKey="tradicional" stroke={T.danger} fill="url(#gTradicional)" strokeWidth={2} name="Mídia Tradicional" />
                  <Area type="monotone" dataKey="dooh" stroke={T.green} fill="url(#gDooh)" strokeWidth={2} name="DOOHPLAY" />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 3, background: T.green, borderRadius: 2 }} /><span style={{ fontSize: 11, color: T.textSub }}>DOOHPLAY</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 3, background: T.danger, borderRadius: 2 }} /><span style={{ fontSize: 11, color: T.textSub }}>Tradicional</span></div>
              </div>
            </div>

            <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px", color: T.text }}>Mix de Energia</h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={ENERGY_MIX} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                    {ENERGY_MIX.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.textSub}33`, borderRadius: 8, color: T.text, fontSize: 12 }} formatter={(v: any) => [`${v}%`]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 4 }}>
                {ENERGY_MIX.map(e => (
                  <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: e.color }} />
                    <span style={{ fontSize: 11, color: T.textSub }}>{e.name} {e.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px", color: T.text }}>Score ESG por Pilar</h3>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius={68}>
                  <PolarGrid stroke={`${T.textSub}33`} />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: T.textSub, fontSize: 10 }} />
                  <Radar name="Score" dataKey="A" stroke={T.green} fill={T.green} fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px", color: T.text }}>Metas Sustentabilidade 2025</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {GOALS.map(g => (
                <div key={g.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: T.text }}>{g.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: g.current >= g.target * 0.9 ? T.green : T.warning }}>{g.current}{g.unit}</span>
                  </div>
                  <div style={{ height: 6, background: `${T.textSub}33`, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(g.current / g.target) * 100}%`, background: g.current >= g.target * 0.9 ? T.green : T.warning, borderRadius: 4, transition: "width 0.5s" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: T.textSub }}>Atual: {g.current}{g.unit}</span>
                    <span style={{ fontSize: 10, color: T.textSub }}>Meta: {g.target}{g.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "emissions" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px", color: T.text }}>Emissões por Escopo (ton CO₂e)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={SCOPE_DATA} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="scope" tick={{ fill: T.text, fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.textSub}33`, borderRadius: 8, color: T.text, fontSize: 12 }} formatter={(v: any) => [`${v} ton CO₂e`]} />
                <Bar dataKey="ton" fill={T.accent} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {SCOPE_DATA.map(s => (
                <div key={s.scope} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{s.scope}</p>
                    <p style={{ fontSize: 11, color: T.textSub, margin: 0 }}>{s.label}</p>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{s.ton} ton</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px", color: T.text }}>Trajetória de Descarbonização</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={[
                { ano: "2022", real: 210 }, { ano: "2023", real: 184 }, { ano: "2024", real: 145 },
                { ano: "2025", real: 125, meta: 120 }, { ano: "2026", meta: 90 }, { ano: "2027", meta: 60 },
                { ano: "2028", meta: 30 }, { ano: "2030", meta: 0 },
              ]} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gReal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.primary} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={T.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gMeta" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.green} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={T.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="ano" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.textSub}33`, borderRadius: 8, color: T.text, fontSize: 12 }} />
                <Area type="monotone" dataKey="real" stroke={T.primary} fill="url(#gReal)" strokeWidth={2} name="Real" connectNulls />
                <Area type="monotone" dataKey="meta" stroke={T.green} fill="url(#gMeta)" strokeWidth={2} strokeDasharray="5 4" name="Meta Net-Zero" connectNulls />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 16, background: `${T.green}11`, borderRadius: 8, padding: 14, border: `1px solid ${T.green}33` }}>
              <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px", color: T.green }}>Meta Net-Zero 2030</p>
              <p style={{ fontSize: 12, color: T.textSub, margin: 0 }}>Alinhado ao Acordo de Paris — redução de 100% das emissões líquidas em 5 anos</p>
            </div>
          </div>
        </div>
      )}

      {tab === "energy" && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px", color: T.text }}>Consumo Energético por Tipo de Tela (MWh/mês)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[
                { tipo: "Billboard", solar: 18, eolica: 12, hidro: 9, rede: 2 },
                { tipo: "Transit", solar: 9, eolica: 7, hidro: 4, rede: 1 },
                { tipo: "Retail", solar: 14, eolica: 9, hidro: 6, rede: 3 },
                { tipo: "Indoor", solar: 11, eolica: 8, hidro: 5, rede: 2 },
                { tipo: "Smart City", solar: 6, eolica: 5, hidro: 3, rede: 1 },
              ]} margin={{ left: -10 }}>
                <XAxis dataKey="tipo" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.textSub}33`, borderRadius: 8, color: T.text, fontSize: 12 }} />
                <Bar dataKey="solar" fill="#FFAA00" stackId="a" name="Solar" />
                <Bar dataKey="eolica" fill="#00C9B1" stackId="a" name="Eólica" />
                <Bar dataKey="hidro" fill={T.primary} stackId="a" name="Hidro" />
                <Bar dataKey="rede" fill={T.textSub} stackId="a" name="Rede" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "Consumo total/mês", value: "184 MWh", icon: <Zap size={18} color={T.warning} />, color: T.warning },
              { label: "Geração solar própria", value: "76 MWh", icon: <Globe size={18} color={T.green} />, color: T.green },
              { label: "RECs adquiridos", value: "1.240", icon: <Award size={18} color={T.primary} />, color: T.primary },
              { label: "Economia vs 2023", value: "R$ 42k", icon: <Target size={18} color={T.teal} />, color: T.teal },
            ].map(k => (
              <div key={k.label} style={{ background: T.panel, borderRadius: 12, padding: 18, border: `1px solid ${k.color}22`, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ background: `${k.color}18`, padding: 10, borderRadius: 8 }}>{k.icon}</div>
                <div>
                  <p style={{ fontSize: 11, color: T.textSub, margin: 0 }}>{k.label}</p>
                  <p style={{ fontSize: 20, fontWeight: 800, margin: 0, color: k.color }}>{k.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "certificates" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {CERTS.map(c => (
            <div key={c.name} style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${c.status === "active" ? T.green : T.warning}33`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: c.status === "active" ? `${T.green}18` : `${T.warning}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Award size={20} color={c.status === "active" ? T.green : T.warning} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: 12, color: T.textSub, margin: "3px 0 0" }}>Emitido: {c.issued} · Válido até: {c.valid}{c.mwh ? ` · ${c.mwh} MWh` : ""}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6, background: c.status === "active" ? `${T.green}22` : `${T.warning}22`, color: c.status === "active" ? T.green : T.warning }}>
                  {c.status === "active" ? "Ativo" : "Pendente"}
                </span>
                <button style={{ background: T.card, border: `1px solid ${T.textSub}33`, borderRadius: 7, padding: "6px 14px", color: T.text, cursor: "pointer", fontSize: 12 }}>
                  <Download size={12} style={{ display: "inline", marginRight: 4 }} /> PDF
                </button>
              </div>
            </div>
          ))}
          <div style={{ background: `${T.primary}11`, borderRadius: 12, padding: 20, border: `1px solid ${T.primary}33`, textAlign: "center" }}>
            <BarChart2 size={24} color={T.primary} style={{ marginBottom: 8 }} />
            <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>Adicionar Nova Certificação</p>
            <p style={{ fontSize: 12, color: T.textSub, margin: "0 0 12px" }}>Conecte novos selos ambientais ao seu perfil ESG</p>
            <button style={{ background: T.primary, color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Solicitar Certificação</button>
          </div>
        </div>
      )}
    </div>
  );
}
