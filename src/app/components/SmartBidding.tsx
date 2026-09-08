import { useState, useEffect, useRef } from "react";
import { Gavel, Activity, TrendingUp, DollarSign, Zap, Clock, Filter, RefreshCw } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ScatterChart, Scatter, Cell
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82",
  warning: "#FFAA00", danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280",
};

interface Props { onBack: () => void; onNavigate: (v: string) => void; }

type BidStatus = "won" | "lost" | "pending";

interface BidEntry {
  id: string;
  screen: string;
  city: string;
  format: string;
  floor: number;
  bid: number;
  clearing: number;
  status: BidStatus;
  ts: string;
  impressions: number;
}

const CITIES = ["São Paulo", "Rio de Janeiro", "Brasília", "Belo Horizonte", "Curitiba", "Porto Alegre"];
const FORMATS = ["Billboard 14×4", "Transit Media", "Retail Indoor", "Smart City", "Shopping"];
const SCREENS = ["Shopping Ibirapuera", "Av. Paulista #234", "Rodoanel Norte", "BH Shopping", "Salgado Filho"];

function rng(min: number, max: number) { return Math.round(min + Math.random() * (max - min)); }
function genBid(): BidEntry {
  const floor = rng(12, 45);
  const bid = Math.round(floor * (1 + Math.random() * 0.6));
  const clearing = Math.round(floor * (1 + Math.random() * 0.4));
  const status: BidStatus = bid > clearing ? "won" : Math.random() > 0.3 ? "lost" : "pending";
  return {
    id: Math.random().toString(36).slice(2, 8).toUpperCase(),
    screen: SCREENS[rng(0, SCREENS.length - 1)],
    city: CITIES[rng(0, CITIES.length - 1)],
    format: FORMATS[rng(0, FORMATS.length - 1)],
    floor, bid, clearing, status,
    ts: new Date().toLocaleTimeString("pt-BR"),
    impressions: rng(800, 12000),
  };
}

const INITIAL_LOG: BidEntry[] = Array.from({ length: 18 }, genBid);

const WIN_RATE_DATA = Array.from({ length: 12 }, (_, i) => ({
  cpm: (15 + i * 3),
  winRate: Math.min(95, 20 + i * 6 + rng(-5, 5)),
  volume: rng(50, 400),
}));

const FLOOR_PRICES = [
  { city: "São Paulo", billboard: 38, transit: 24, retail: 19, smart: 28 },
  { city: "Rio de Janeiro", billboard: 32, transit: 20, retail: 16, smart: 24 },
  { city: "Brasília", billboard: 28, transit: 18, retail: 14, smart: 22 },
  { city: "Belo Horizonte", billboard: 24, transit: 15, retail: 12, smart: 18 },
  { city: "Curitiba", billboard: 22, transit: 14, retail: 11, smart: 16 },
];

const PACING_DATA = Array.from({ length: 24 }, (_, i) => ({
  hora: `${String(i).padStart(2, "00")}h`,
  gasto: i < 14 ? rng(800, 2400) : 0,
  meta: 2000,
}));

export default function SmartBidding({ onBack }: Props) {
  const [bidLog, setBidLog] = useState<BidEntry[]>(INITIAL_LOG);
  const [live, setLive] = useState(true);
  const [tab, setTab] = useState<"log" | "landscape" | "floors" | "pacing">("log");
  const [filterStatus, setFilterStatus] = useState<BidStatus | "all">("all");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (live) {
      intervalRef.current = setInterval(() => {
        setBidLog(prev => [genBid(), ...prev.slice(0, 49)]);
      }, 1400);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [live]);

  const filtered = filterStatus === "all" ? bidLog : bidLog.filter(b => b.status === filterStatus);
  const wonCount = bidLog.filter(b => b.status === "won").length;
  const winRate = Math.round((wonCount / bidLog.length) * 100);
  const avgCPM = Math.round(bidLog.filter(b => b.status === "won").reduce((a, b) => a + b.clearing, 0) / Math.max(wonCount, 1));
  const totalImpressions = bidLog.filter(b => b.status === "won").reduce((a, b) => a + b.impressions, 0);

  const statusColor = (s: BidStatus) => s === "won" ? T.success : s === "lost" ? T.danger : T.warning;
  const statusLabel = (s: BidStatus) => ({ won: "Ganhou", lost: "Perdeu", pending: "Pendente" }[s]);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif", padding: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: T.card, border: `1px solid ${T.textSub}22`, borderRadius: 8, padding: "6px 14px", color: T.textSub, cursor: "pointer", fontSize: 13 }}>← Voltar</button>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${T.accent}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Gavel size={20} color={T.accent} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Smart Bidding</h1>
            <p style={{ fontSize: 13, color: T.textSub, margin: 0 }}>Leilão programático em tempo real</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: live ? T.success : T.textSub, animation: live ? "pulse 1.5s infinite" : "none" }} />
            <span style={{ fontSize: 13, color: live ? T.success : T.textSub, fontWeight: 600 }}>{live ? "LIVE" : "PAUSADO"}</span>
          </div>
          <button onClick={() => setLive(v => !v)} style={{ background: live ? `${T.danger}22` : `${T.success}22`, border: `1px solid ${live ? T.danger : T.success}44`, borderRadius: 8, padding: "7px 14px", color: live ? T.danger : T.success, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {live ? "Pausar" : "Retomar"}
          </button>
          <button onClick={() => setBidLog(INITIAL_LOG)} style={{ background: T.panel, border: `1px solid ${T.textSub}33`, borderRadius: 8, padding: "7px 10px", color: T.textSub, cursor: "pointer" }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Win Rate", value: `${winRate}%`, sub: `${wonCount} de ${bidLog.length} leilões`, color: T.success, icon: <Gavel size={16} color={T.success} /> },
          { label: "CPM Médio (ganhos)", value: `R$ ${avgCPM}`, sub: "clearing price médio", color: T.primary, icon: <DollarSign size={16} color={T.primary} /> },
          { label: "Impressões conquistadas", value: totalImpressions.toLocaleString("pt-BR"), sub: "últimos 50 leilões", color: T.accent, icon: <Activity size={16} color={T.accent} /> },
          { label: "Leilões / hora", value: `~${rng(180, 240)}`, sub: "taxa estimada", color: T.warning, icon: <Clock size={16} color={T.warning} /> },
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

      <div style={{ display: "flex", gap: 4, marginBottom: 22, background: T.card, borderRadius: 10, padding: 4, width: "fit-content" }}>
        {(["log", "landscape", "floors", "pacing"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
            background: tab === t ? T.panel : "transparent",
            color: tab === t ? T.text : T.textSub,
          }}>
            {{ log: "Log de Leilões", landscape: "Bid Landscape", floors: "Floor Prices", pacing: "Budget Pacing" }[t]}
          </button>
        ))}
      </div>

      {tab === "log" && (
        <div style={{ background: T.panel, borderRadius: 12, border: `1px solid ${T.textSub}18`, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.textSub}22`, display: "flex", alignItems: "center", gap: 10 }}>
            <Filter size={14} color={T.textSub} />
            {(["all", "won", "lost", "pending"] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500,
                background: filterStatus === s ? T.card : "transparent",
                color: filterStatus === s ? T.text : T.textSub,
              }}>
                {{ all: "Todos", won: "Ganhos", lost: "Perdidos", pending: "Pendentes" }[s]}
              </button>
            ))}
          </div>
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead style={{ position: "sticky", top: 0, background: T.panel, zIndex: 1 }}>
                <tr>
                  {["ID", "Tela", "Cidade", "Formato", "Floor CPM", "Bid", "Clearing", "Impr.", "Status", "Horário"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: T.textSub, fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr key={b.id + i} style={{ borderTop: `1px solid ${T.textSub}18`, transition: "background 0.1s" }}>
                    <td style={{ padding: "9px 14px", fontFamily: "monospace", color: T.textSub }}>{b.id}</td>
                    <td style={{ padding: "9px 14px", fontWeight: 500 }}>{b.screen}</td>
                    <td style={{ padding: "9px 14px", color: T.textSub }}>{b.city}</td>
                    <td style={{ padding: "9px 14px", color: T.textSub }}>{b.format}</td>
                    <td style={{ padding: "9px 14px", color: T.text }}>R$ {b.floor}</td>
                    <td style={{ padding: "9px 14px", fontWeight: 600, color: b.bid > b.clearing ? T.success : T.danger }}>R$ {b.bid}</td>
                    <td style={{ padding: "9px 14px", color: T.text }}>R$ {b.clearing}</td>
                    <td style={{ padding: "9px 14px", color: T.textSub }}>{b.impressions.toLocaleString("pt-BR")}</td>
                    <td style={{ padding: "9px 14px" }}>
                      <span style={{ padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: `${statusColor(b.status)}22`, color: statusColor(b.status) }}>
                        {statusLabel(b.status)}
                      </span>
                    </td>
                    <td style={{ padding: "9px 14px", color: T.textSub, whiteSpace: "nowrap" }}>{b.ts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "landscape" && (
        <div style={{ background: T.panel, borderRadius: 12, padding: 24, border: `1px solid ${T.textSub}18` }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>Landscape de Lances — Win Rate vs CPM</h3>
          <p style={{ fontSize: 12, color: T.textSub, margin: "0 0 20px" }}>Tamanho do ponto representa volume de impressões disponíveis</p>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <XAxis dataKey="cpm" name="CPM (R$)" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} label={{ value: "CPM (R$)", position: "insideBottom", offset: -4, fill: T.textSub, fontSize: 11 }} />
              <YAxis dataKey="winRate" name="Win Rate" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} label={{ value: "Win Rate", angle: -90, position: "insideLeft", fill: T.textSub, fontSize: 11 }} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3", stroke: T.textSub }}
                contentStyle={{ background: T.card, border: `1px solid ${T.textSub}33`, borderRadius: 8, color: T.text, fontSize: 12 }}
                formatter={(v: any, name: any) => [name === "Win Rate" ? `${v}%` : `R$ ${v}`, name]}
              />
              <Scatter data={WIN_RATE_DATA} fill={T.primary}>
                {WIN_RATE_DATA.map((e, i) => (
                  <Cell key={i} fill={e.winRate > 60 ? T.success : e.winRate > 40 ? T.warning : T.danger} opacity={0.8} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 8, justifyContent: "center" }}>
            {[{ label: "Win Rate > 60%", color: T.success }, { label: "Win Rate 40-60%", color: T.warning }, { label: "Win Rate < 40%", color: T.danger }].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: l.color }} />
                <span style={{ fontSize: 11, color: T.textSub }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "floors" && (
        <div style={{ background: T.panel, borderRadius: 12, border: `1px solid ${T.textSub}18`, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.textSub}22` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Floor Prices por Cidade e Formato (CPM R$)</h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: T.card }}>
                <th style={{ textAlign: "left", padding: "11px 18px", color: T.textSub, fontWeight: 500 }}>Cidade</th>
                {["Billboard", "Transit", "Retail", "Smart City"].map(h => (
                  <th key={h} style={{ textAlign: "center", padding: "11px 18px", color: T.textSub, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FLOOR_PRICES.map((row, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${T.textSub}18` }}>
                  <td style={{ padding: "12px 18px", fontWeight: 600 }}>{row.city}</td>
                  {[row.billboard, row.transit, row.retail, row.smart].map((v, j) => (
                    <td key={j} style={{ textAlign: "center", padding: "12px 18px" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontWeight: 700, color: T.text }}>R$ {v}</span>
                        <button style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, border: `1px solid ${T.textSub}33`, background: "transparent", color: T.textSub, cursor: "pointer" }}>editar</button>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "pacing" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: T.panel, borderRadius: 12, padding: 24, border: `1px solid ${T.textSub}18` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Gasto por Hora (R$)</h3>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: T.textSub }}>Meta: R$ 2.000/h</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.success }}>Gasto: R$ 34.8k / R$ 48k budget</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={PACING_DATA} margin={{ left: -10 }}>
                <XAxis dataKey="hora" tick={{ fill: T.textSub, fontSize: 9 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
                <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.textSub}33`, borderRadius: 8, color: T.text, fontSize: 12 }} formatter={(v: any) => [`R$ ${v}`]} />
                <Bar dataKey="gasto" fill={T.primary} radius={[3, 3, 0, 0]} name="Gasto" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {[
              { label: "Budget Total", value: "R$ 48.000", sub: "campanhas ativas hoje", color: T.text },
              { label: "Gasto até agora", value: "R$ 34.800", sub: "72.5% do budget", color: T.warning },
              { label: "Restante", value: "R$ 13.200", sub: "até fim do dia", color: T.success },
            ].map(k => (
              <div key={k.label} style={{ background: T.panel, borderRadius: 12, padding: 18, border: `1px solid ${T.textSub}18` }}>
                <p style={{ fontSize: 12, color: T.textSub, margin: "0 0 6px" }}>{k.label}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
                <p style={{ fontSize: 11, color: T.textSub, margin: "4px 0 0" }}>{k.sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
