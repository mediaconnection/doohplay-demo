import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Activity, Zap, Tv, DollarSign, Users, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type DataPoint = { t: string; imp: number; rev: number; ctr: number; online: number };

function rand(base: number, variance: number) {
  return Math.round(base + (Math.random() - 0.5) * variance * 2);
}

function makePoint(): DataPoint {
  const now = new Date();
  return {
    t: `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}:${now.getSeconds().toString().padStart(2,"0")}`,
    imp: rand(12400, 2000),
    rev: rand(840, 120),
    ctr: parseFloat((rand(42, 8) / 10).toFixed(1)),
    online: rand(634, 12),
  };
}

function AnimatedCounter({ value, prefix = "", suffix = "", color }: { value: number; prefix?: string; suffix?: string; color: string }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const start = prev.current;
    const diff = value - start;
    const steps = 20;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplay(Math.round(start + diff * (i / steps)));
      if (i >= steps) { clearInterval(id); prev.current = value; }
    }, 16);
    return () => clearInterval(id);
  }, [value]);
  return <span style={{ color }}>{prefix}{display.toLocaleString("pt-BR")}{suffix}</span>;
}

const ALERTS = [
  { id: 1, type: "warn",  msg: "Tela offline · Av. Rebouças #12",               time: "00:32" },
  { id: 2, type: "info",  msg: "Campanha Ambev atingiu 50% do budget",           time: "01:15" },
  { id: 3, type: "ok",    msg: "Reconectada · Terminal 2 GRU",                   time: "02:48" },
  { id: 4, type: "warn",  msg: "CPM acima da média · setor financeiro +18%",     time: "03:21" },
  { id: 5, type: "info",  msg: "Novo anunciante · conta Enterprise ativada",     time: "04:02" },
];

export default function RealtimeDashboard({ onBack }: Props) {
  const [data, setData]       = useState<DataPoint[]>(() => Array.from({ length: 30 }, () => makePoint()));
  const [paused, setPaused]   = useState(false);
  const [alerts, setAlerts]   = useState(ALERTS);
  const alertId               = useRef(10);

  const latest = data[data.length - 1];

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      const pt = makePoint();
      setData(d => [...d.slice(-59), pt]);
      // occasionally add an alert
      if (Math.random() < 0.08) {
        const msgs = [
          "Nova impressão recorde · Paulista",
          "A/B test variante B vencendo +12%",
          "Anomalia detectada · CTR pico",
          "Tela reativada após manutenção",
        ];
        setAlerts(a => [{
          id: alertId.current++,
          type: ["info","ok","warn"][Math.floor(Math.random()*3)] as any,
          msg: msgs[Math.floor(Math.random()*msgs.length)],
          time: new Date().toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" }),
        }, ...a].slice(0, 12));
      }
    }, 1200);
    return () => clearInterval(id);
  }, [paused]);

  const alertColors = { ok: T.success, info: T.primary, warn: T.warning };

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.danger + "20" }}>
                <Activity size={18} style={{ color: T.danger }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Realtime Dashboard</h1>
                <p className="text-xs flex items-center gap-1.5" style={{ color: T.textSub }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: T.success }} />
                  Dados ao vivo · atualização 1.2s
                </p>
              </div>
            </div>
          </div>
          <button onClick={() => setPaused(p => !p)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: paused ? T.warning + "20" : T.card, color: paused ? T.warning : T.textSub, border: `1px solid ${paused ? T.warning + "40" : T.border}` }}>
            {paused ? <><RefreshCw size={13} /> Retomar</> : <><Activity size={13} /> Pausar</>}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Big KPI counters */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Impressões/min",  value: latest.imp,    prefix: "",   suffix: "",  color: T.primary, icon: Tv,         sparkData: data.map(d => ({ v: d.imp  })) },
            { label: "Receita/min",     value: latest.rev,    prefix: "R$", suffix: "",  color: T.gold,    icon: DollarSign, sparkData: data.map(d => ({ v: d.rev  })) },
            { label: "CTR médio",       value: latest.ctr*10, prefix: "",   suffix: "%", color: T.success, icon: TrendingUp, sparkData: data.map(d => ({ v: d.ctr  })) },
            { label: "Telas online",    value: latest.online, prefix: "",   suffix: "",  color: T.accent,  icon: Activity,   sparkData: data.map(d => ({ v: d.online})) },
          ].map((kpi, i) => (
            <div key={i} className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-black" style={{ color: T.textSub }}>{kpi.label.toUpperCase()}</div>
                <kpi.icon size={14} style={{ color: kpi.color }} />
              </div>
              <div className="font-black text-3xl mb-3">
                <AnimatedCounter value={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} color={kpi.color} />
              </div>
              <ResponsiveContainer width="100%" height={40}>
                <AreaChart data={kpi.sparkData}>
                  <Area type="monotone" dataKey="v" stroke={kpi.color} fill={kpi.color + "20"} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Impressions chart */}
          <div className="col-span-2 p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-black">Impressões em tempo real</div>
                <div className="text-xs" style={{ color: T.textSub }}>Últimos 60 segundos</div>
              </div>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: T.success }} />
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="rtGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={T.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" tick={false} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 11 }}
                  formatter={(v: number) => [v.toLocaleString("pt-BR"), "Impressões"]} labelFormatter={() => ""} />
                <Area type="monotone" dataKey="imp" stroke={T.primary} fill="url(#rtGrad)" strokeWidth={2} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Alert feed */}
          <div className="p-5 rounded-2xl border flex flex-col" style={{ background: T.card, borderColor: T.border }}>
            <div className="flex items-center justify-between mb-4">
              <div className="font-black text-sm">Alertas</div>
              <AlertCircle size={14} style={{ color: T.warning }} />
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto" style={{ maxHeight: 220 }}>
              {alerts.map(a => (
                <div key={a.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0"
                    style={{ background: alertColors[a.type as keyof typeof alertColors] }} />
                  <div className="flex-1" style={{ color: T.text }}>{a.msg}</div>
                  <div className="font-mono flex-shrink-0" style={{ color: T.textSub }}>{a.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue + CTR charts */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Receita/min (R$)", key: "rev" as const, color: T.gold,    grad: "revGrad"  },
            { label: "CTR (%)",          key: "ctr" as const, color: T.success, grad: "ctrGrad"  },
          ].map(chart => (
            <div key={chart.key} className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="font-black text-sm mb-4">{chart.label}</div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id={chart.grad} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chart.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chart.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 11 }}
                    formatter={(v: number) => [v, chart.label]} labelFormatter={() => ""} />
                  <Area type="monotone" dataKey={chart.key} stroke={chart.color} fill={`url(#${chart.grad})`} strokeWidth={2} dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>

        {/* Live screen status grid */}
        <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
          <div className="font-black mb-4 text-sm">Status das Telas — Principais Cidades</div>
          <div className="grid grid-cols-6 gap-2">
            {[
              { city:"SP",  screens:287, online:281, color: T.primary },
              { city:"RJ",  screens:142, online:138, color: T.success },
              { city:"BH",  screens:89,  online:86,  color: T.accent  },
              { city:"BSB", screens:67,  online:65,  color: T.gold    },
              { city:"POA", screens:98,  online:96,  color: T.primary },
              { city:"CWB", screens:76,  online:72,  color: T.success },
              { city:"SSA", screens:54,  online:50,  color: T.warning },
              { city:"REC", screens:48,  online:47,  color: T.accent  },
              { city:"FOR", screens:43,  online:42,  color: T.primary },
              { city:"GRU", screens:34,  online:33,  color: T.gold    },
              { city:"MAN", screens:28,  online:26,  color: T.textSub },
              { city:"BEL", screens:22,  online:21,  color: T.textSub },
            ].map(c => {
              const pct = Math.round((c.online / c.screens) * 100);
              return (
                <div key={c.city} className="p-3 rounded-xl" style={{ background: T.panel }}>
                  <div className="font-black text-sm mb-1" style={{ color: c.color }}>{c.city}</div>
                  <div className="text-xs mb-1.5" style={{ color: T.textSub }}>{c.online}/{c.screens}</div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.border }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct > 95 ? T.success : pct > 85 ? T.warning : T.danger }} />
                  </div>
                  <div className="text-xs mt-1 font-bold" style={{ color: pct > 95 ? T.success : pct > 85 ? T.warning : T.danger }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
