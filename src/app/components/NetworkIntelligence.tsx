import { useState, useEffect } from "react";
import { Waypoints, AlertTriangle, CheckCircle, XCircle, RefreshCw, Wifi, WifiOff, Zap, Clock, BarChart2 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82",
  warning: "#FFAA00", danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280",
};

interface Props { onBack: () => void; onNavigate: (v: string) => void; }

type ScreenStatus = "online" | "offline" | "degraded" | "maintenance";

interface NetworkNode {
  id: string;
  name: string;
  city: string;
  region: string;
  status: ScreenStatus;
  uptime: number;
  latency: number;
  lastSeen: string;
  incidents: number;
}

function rng(min: number, max: number) { return Math.round(min + Math.random() * (max - min)); }

const NODES: NetworkNode[] = [
  { id: "N001", name: "POA-BILLBOARD-001", city: "São Paulo", region: "Sudeste", status: "online", uptime: 99.8, latency: 12, lastSeen: "agora", incidents: 0 },
  { id: "N002", name: "RIO-TRANSIT-044", city: "Rio de Janeiro", region: "Sudeste", status: "online", uptime: 99.2, latency: 18, lastSeen: "1 min", incidents: 1 },
  { id: "N003", name: "BSB-RETAIL-012", city: "Brasília", region: "Centro-Oeste", status: "degraded", uptime: 96.1, latency: 142, lastSeen: "2 min", incidents: 3 },
  { id: "N004", name: "BHZ-SMART-007", city: "Belo Horizonte", region: "Sudeste", status: "online", uptime: 99.5, latency: 24, lastSeen: "agora", incidents: 0 },
  { id: "N005", name: "CWB-INDOOR-023", city: "Curitiba", region: "Sul", status: "offline", uptime: 88.4, latency: 0, lastSeen: "47 min", incidents: 7 },
  { id: "N006", name: "POA-TRANSIT-018", city: "Porto Alegre", region: "Sul", status: "online", uptime: 99.7, latency: 15, lastSeen: "agora", incidents: 0 },
  { id: "N007", name: "SSA-BILLBOARD-003", city: "Salvador", region: "Nordeste", status: "maintenance", uptime: 94.2, latency: 0, lastSeen: "2h", incidents: 2 },
  { id: "N008", name: "FOR-SMART-011", city: "Fortaleza", region: "Nordeste", status: "online", uptime: 98.9, latency: 31, lastSeen: "1 min", incidents: 1 },
  { id: "N009", name: "REC-TRANSIT-006", city: "Recife", region: "Nordeste", status: "degraded", uptime: 97.3, latency: 89, lastSeen: "3 min", incidents: 2 },
  { id: "N010", name: "MAN-BILLBOARD-002", city: "Manaus", region: "Norte", status: "online", uptime: 97.8, latency: 58, lastSeen: "2 min", incidents: 1 },
  { id: "N011", name: "GYN-INDOOR-014", city: "Goiânia", region: "Centro-Oeste", status: "online", uptime: 99.1, latency: 21, lastSeen: "agora", incidents: 0 },
  { id: "N012", name: "VIX-RETAIL-009", city: "Vitória", region: "Sudeste", status: "offline", uptime: 82.1, latency: 0, lastSeen: "3h", incidents: 9 },
];

const INCIDENTS = [
  { id: "INC-2847", severity: "critical", title: "CWB-INDOOR-023 offline — falha de energia", ts: "16:12", resolved: false },
  { id: "INC-2846", severity: "critical", title: "VIX-RETAIL-009 offline — link de dados caído", ts: "13:08", resolved: false },
  { id: "INC-2845", severity: "warning", title: "BSB-RETAIL-012 — latência elevada (142ms)", ts: "15:44", resolved: false },
  { id: "INC-2844", severity: "warning", title: "REC-TRANSIT-006 — degradação de rede", ts: "14:22", resolved: false },
  { id: "INC-2843", severity: "info", title: "SSA-BILLBOARD-003 — janela de manutenção programada", ts: "10:00", resolved: false },
  { id: "INC-2842", severity: "info", title: "FOR-SMART-011 — atualização de firmware aplicada", ts: "08:30", resolved: true },
  { id: "INC-2841", severity: "warning", title: "RIO-TRANSIT-044 — reinicialização automática", ts: "07:15", resolved: true },
];

const UPTIME_REGIONS = [
  { region: "Sudeste", uptime: 99.1, screens: 412 },
  { region: "Sul", uptime: 96.8, screens: 216 },
  { region: "Nordeste", uptime: 97.4, screens: 187 },
  { region: "Centro-Oeste", uptime: 97.6, screens: 94 },
  { region: "Norte", uptime: 97.8, screens: 43 },
];

const LATENCY_TREND = Array.from({ length: 24 }, (_, i) => ({
  hora: `${String(i).padStart(2, "0")}h`,
  p50: rng(12, 28),
  p95: rng(40, 120),
  p99: rng(80, 240),
}));

const statusColor = (s: ScreenStatus) => ({ online: T.success, offline: T.danger, degraded: T.warning, maintenance: T.primary })[s];
const statusLabel = (s: ScreenStatus) => ({ online: "Online", offline: "Offline", degraded: "Degradado", maintenance: "Manutenção" })[s];
const statusIcon = (s: ScreenStatus) => {
  if (s === "online") return <CheckCircle size={14} color={T.success} />;
  if (s === "offline") return <XCircle size={14} color={T.danger} />;
  if (s === "degraded") return <AlertTriangle size={14} color={T.warning} />;
  return <Clock size={14} color={T.primary} />;
};
const sevColor = (s: string) => s === "critical" ? T.danger : s === "warning" ? T.warning : T.textSub;

export default function NetworkIntelligence({ onBack }: Props) {
  const [tab, setTab] = useState<"overview" | "nodes" | "incidents" | "latency">("overview");
  const [filterStatus, setFilterStatus] = useState<ScreenStatus | "all">("all");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const online = NODES.filter(n => n.status === "online").length;
  const offline = NODES.filter(n => n.status === "offline").length;
  const degraded = NODES.filter(n => n.status === "degraded" || n.status === "maintenance").length;
  const avgUptime = Math.round(NODES.reduce((s, n) => s + n.uptime, 0) / NODES.length * 10) / 10;
  const filtered = filterStatus === "all" ? NODES : NODES.filter(n => n.status === filterStatus);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif", padding: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: T.card, border: `1px solid ${T.textSub}22`, borderRadius: 8, padding: "6px 14px", color: T.textSub, cursor: "pointer", fontSize: 13 }}>← Voltar</button>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${T.primary}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Waypoints size={20} color={T.primary} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Network Intelligence</h1>
            <p style={{ fontSize: 13, color: T.textSub, margin: 0 }}>Monitoramento de rede em tempo real — {NODES.length} nós</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.success, animation: "pulse 1.5s infinite" }} />
            <span style={{ fontSize: 13, color: T.success, fontWeight: 600 }}>Monitorando</span>
          </div>
          <button style={{ background: T.panel, border: `1px solid ${T.textSub}33`, borderRadius: 8, padding: "7px 10px", color: T.textSub, cursor: "pointer" }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Status summary bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Online", value: online, total: NODES.length, color: T.success, icon: <Wifi size={16} color={T.success} /> },
          { label: "Degradados / Manutenção", value: degraded, total: NODES.length, color: T.warning, icon: <AlertTriangle size={16} color={T.warning} /> },
          { label: "Offline", value: offline, total: NODES.length, color: T.danger, icon: <WifiOff size={16} color={T.danger} /> },
          { label: "Uptime Médio", value: `${avgUptime}%`, total: null, color: avgUptime > 99 ? T.success : T.warning, icon: <BarChart2 size={16} color={avgUptime > 99 ? T.success : T.warning} /> },
        ].map(k => (
          <div key={k.label} style={{ background: T.panel, borderRadius: 12, padding: "16px 18px", border: `1px solid ${k.color}22` }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p style={{ fontSize: 11, color: T.textSub, margin: "0 0 6px" }}>{k.label}</p>
              {k.icon}
            </div>
            <p style={{ fontSize: 26, fontWeight: 800, margin: 0, color: k.color }}>
              {k.total ? k.value : k.value}
              {k.total && <span style={{ fontSize: 14, color: T.textSub, fontWeight: 400 }}> / {k.total}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 22, background: T.card, borderRadius: 10, padding: 4, width: "fit-content" }}>
        {(["overview", "nodes", "incidents", "latency"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
            background: tab === t ? T.panel : "transparent", color: tab === t ? T.text : T.textSub,
          }}>
            {{ overview: "Visão Geral", nodes: "Nós de Rede", incidents: `Incidentes (${INCIDENTS.filter(i => !i.resolved).length})`, latency: "Latência" }[t]}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Region uptime */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>Uptime por Região (%)</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {UPTIME_REGIONS.map(r => (
                  <div key={r.region}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{r.region}</span>
                      <div style={{ display: "flex", gap: 10, fontSize: 12, color: T.textSub }}>
                        <span>{r.screens} telas</span>
                        <span style={{ fontWeight: 700, color: r.uptime > 99 ? T.success : T.warning }}>{r.uptime}%</span>
                      </div>
                    </div>
                    <div style={{ height: 7, background: `${T.textSub}22`, borderRadius: 4 }}>
                      <div style={{ height: "100%", width: `${r.uptime}%`, background: r.uptime > 99 ? T.success : T.warning, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status distribution */}
            <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>Distribuição de Status</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {(["online", "degraded", "maintenance", "offline"] as ScreenStatus[]).map(s => {
                  const count = NODES.filter(n => n.status === s).length;
                  return (
                    <div key={s} style={{ background: T.card, borderRadius: 10, padding: 14, border: `1px solid ${statusColor(s)}33` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        {statusIcon(s)}
                        <span style={{ fontSize: 12, color: statusColor(s), fontWeight: 600 }}>{statusLabel(s)}</span>
                      </div>
                      <p style={{ fontSize: 28, fontWeight: 800, color: statusColor(s), margin: 0 }}>{count}</p>
                      <p style={{ fontSize: 11, color: T.textSub, margin: "2px 0 0" }}>{Math.round(count / NODES.length * 100)}% da rede</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active incidents preview */}
          <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Incidentes Ativos</h3>
              <button onClick={() => setTab("incidents")} style={{ fontSize: 12, color: T.primary, background: "transparent", border: "none", cursor: "pointer" }}>Ver todos →</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {INCIDENTS.filter(i => !i.resolved).slice(0, 4).map(inc => (
                <div key={inc.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: T.card, borderRadius: 8, border: `1px solid ${sevColor(inc.severity)}33` }}>
                  <AlertTriangle size={14} color={sevColor(inc.severity)} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, margin: 0, fontWeight: 500 }}>{inc.title}</p>
                  </div>
                  <span style={{ fontSize: 11, color: T.textSub }}>{inc.ts}</span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: `${sevColor(inc.severity)}22`, color: sevColor(inc.severity), fontWeight: 600, textTransform: "capitalize" }}>{inc.severity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "nodes" && (
        <div style={{ background: T.panel, borderRadius: 12, border: `1px solid ${T.textSub}18`, overflow: "hidden" }}>
          <div style={{ padding: "12px 18px", borderBottom: `1px solid ${T.textSub}22`, display: "flex", gap: 6 }}>
            {(["all", "online", "degraded", "maintenance", "offline"] as const).map(f => (
              <button key={f} onClick={() => setFilterStatus(f as any)} style={{
                padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500,
                background: filterStatus === f ? T.card : "transparent", color: filterStatus === f ? T.text : T.textSub,
              }}>
                {{ all: "Todos", online: "Online", degraded: "Degradado", maintenance: "Manutenção", offline: "Offline" }[f]}
              </button>
            ))}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  {["Nó", "Cidade", "Região", "Status", "Uptime", "Latência", "Último Sinal", "Incidentes"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: T.textSub, fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(n => (
                  <tr key={n.id} style={{ borderTop: `1px solid ${T.textSub}18` }}>
                    <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 11, color: T.textSub }}>{n.name}</td>
                    <td style={{ padding: "10px 14px", fontWeight: 600 }}>{n.city}</td>
                    <td style={{ padding: "10px 14px", color: T.textSub }}>{n.region}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 6, background: `${statusColor(n.status)}18`, color: statusColor(n.status), fontSize: 11, fontWeight: 600 }}>
                        {statusIcon(n.status)} {statusLabel(n.status)}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 40, height: 4, background: `${T.textSub}22`, borderRadius: 2 }}>
                          <div style={{ height: "100%", width: `${n.uptime}%`, background: n.uptime > 99 ? T.success : n.uptime > 95 ? T.warning : T.danger, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontWeight: 700, color: n.uptime > 99 ? T.success : n.uptime > 95 ? T.warning : T.danger }}>{n.uptime}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px", color: n.status === "offline" ? T.textSub : n.latency > 100 ? T.danger : n.latency > 50 ? T.warning : T.success, fontWeight: 600 }}>
                      {n.status === "offline" || n.status === "maintenance" ? "—" : `${n.latency}ms`}
                    </td>
                    <td style={{ padding: "10px 14px", color: T.textSub }}>{n.lastSeen}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ color: n.incidents > 5 ? T.danger : n.incidents > 0 ? T.warning : T.textSub, fontWeight: n.incidents > 0 ? 700 : 400 }}>{n.incidents}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "incidents" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {INCIDENTS.map(inc => (
            <div key={inc.id} style={{ background: T.panel, borderRadius: 12, padding: 16, border: `1px solid ${inc.resolved ? T.textSub + "18" : sevColor(inc.severity) + "44"}`, display: "flex", alignItems: "center", gap: 14, opacity: inc.resolved ? 0.55 : 1 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${sevColor(inc.severity)}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {inc.resolved ? <CheckCircle size={16} color={T.success} /> : <AlertTriangle size={16} color={sevColor(inc.severity)} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: T.textSub }}>{inc.id}</span>
                  <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 5, background: `${sevColor(inc.severity)}22`, color: sevColor(inc.severity), fontWeight: 700, textTransform: "uppercase" }}>{inc.severity}</span>
                  {inc.resolved && <span style={{ fontSize: 11, color: T.success }}>● Resolvido</span>}
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{inc.title}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 12, color: T.textSub, margin: 0 }}>Hoje {inc.ts}</p>
                {!inc.resolved && (
                  <button style={{ marginTop: 4, background: T.success, color: "#000", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Resolver</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "latency" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: T.panel, borderRadius: 12, padding: 24, border: `1px solid ${T.textSub}18` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>Latência de Rede — 24h (ms)</h3>
            <p style={{ fontSize: 12, color: T.textSub, margin: "0 0 18px" }}>P50 · P95 · P99</p>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={LATENCY_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="gP99" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.danger} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={T.danger} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gP95" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.warning} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={T.warning} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gP50" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.success} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={T.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hora" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}ms`} />
                <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.textSub}33`, borderRadius: 8, color: T.text, fontSize: 12 }} formatter={(v: any, n: any) => [`${v}ms`, n]} />
                <Area type="monotone" dataKey="p99" stroke={T.danger} fill="url(#gP99)" strokeWidth={1.5} name="P99" />
                <Area type="monotone" dataKey="p95" stroke={T.warning} fill="url(#gP95)" strokeWidth={2} name="P95" />
                <Area type="monotone" dataKey="p50" stroke={T.success} fill="url(#gP50)" strokeWidth={2.5} name="P50" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {[
              { label: "P50 Médio", value: "19ms", sub: "mediana", color: T.success },
              { label: "P95 Médio", value: "78ms", sub: "95º percentil", color: T.warning },
              { label: "P99 Máximo", value: "241ms", sub: "pior caso 24h", color: T.danger },
            ].map(k => (
              <div key={k.label} style={{ background: T.panel, borderRadius: 12, padding: 18, border: `1px solid ${k.color}22` }}>
                <p style={{ fontSize: 12, color: T.textSub, margin: "0 0 6px" }}>{k.label}</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
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
