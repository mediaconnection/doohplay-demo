import { useState } from "react";
import { Fingerprint, Copy, Check, TrendingUp, Users, MousePointer, MapPin, Clock, AlertTriangle } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, FunnelChart, Funnel, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, LabelList
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82",
  warning: "#FFAA00", danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280",
};

interface Props { onBack: () => void; onNavigate: (v: string) => void; }

const PIXEL_CODE = `<!-- DOOHPLAY Pixel — cole antes de </head> -->
<script>
  (function(d,o,h,p,l,a,y){
    d[p]=d[p]||function(){(d[p].q=d[p].q||[]).push(arguments)};
    a=o.createElement(h);a.async=1;a.src=l;
    y=o.getElementsByTagName(h)[0];y.parentNode.insertBefore(a,y);
  })(window,document,'script','dooh','https://px.doohplay.com.br/sdk.js');
  dooh('init', 'PX-XXXXXX-YOUR-TOKEN');
  dooh('track', 'PageView');
</script>`;

const LIFT_DATA = [
  { cidade: "São Paulo", exposed: 8.4, control: 3.1, lift: 171 },
  { cidade: "Rio", exposed: 7.2, control: 2.8, lift: 157 },
  { cidade: "Brasília", exposed: 6.1, control: 2.5, lift: 144 },
  { cidade: "BH", exposed: 5.8, control: 2.4, lift: 142 },
  { cidade: "Curitiba", exposed: 5.2, control: 2.2, lift: 136 },
];

const FUNNEL_DATA = [
  { name: "Impactados (DOOH)", value: 184000, fill: T.primary },
  { name: "Visitaram o site", value: 22400, fill: T.accent },
  { name: "Engajaram", value: 8760, fill: T.warning },
  { name: "Converteram", value: 1842, fill: T.success },
];

const TIMELINE = Array.from({ length: 14 }, (_, i) => ({
  dia: `${i + 1}/09`,
  conversoes: Math.round(80 + Math.sin(i * 0.7) * 40 + Math.random() * 30),
  visits: Math.round(1200 + Math.cos(i * 0.5) * 400 + Math.random() * 200),
}));

const CHANNELS = [
  { channel: "DOOH Direto", conversoes: 1842, pct: 46, color: T.primary },
  { channel: "DOOH + Search", conversoes: 980, pct: 24, color: T.accent },
  { channel: "DOOH + Social", conversoes: 720, pct: 18, color: T.success },
  { channel: "Outros", conversoes: 480, pct: 12, color: T.textSub },
];

const EVENTS = [
  { name: "PageView", fires: "184.2k", status: "active" },
  { name: "AddToCart", fires: "12.4k", status: "active" },
  { name: "Purchase", fires: "1.84k", status: "active" },
  { name: "Lead", fires: "6.7k", status: "active" },
  { name: "AppInstall", fires: "892", status: "warning" },
  { name: "VideoPlay", fires: "0", status: "inactive" },
];

export default function PixelTracking({ onBack }: Props) {
  const [tab, setTab] = useState<"overview" | "funnel" | "attribution" | "setup">("overview");
  const [copied, setCopied] = useState(false);
  const [window_, setWindow_] = useState<"1d" | "7d" | "14d" | "30d">("7d");

  const handleCopy = () => {
    navigator.clipboard.writeText(PIXEL_CODE).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif", padding: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: T.card, border: `1px solid ${T.textSub}22`, borderRadius: 8, padding: "6px 14px", color: T.textSub, cursor: "pointer", fontSize: 13 }}>← Voltar</button>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${T.primary}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Fingerprint size={20} color={T.primary} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Pixel & Attribution</h1>
            <p style={{ fontSize: 13, color: T.textSub, margin: 0 }}>Atribuição web para campanhas DOOH · visit lift · multi-touch</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(["1d", "7d", "14d", "30d"] as const).map(w => (
            <button key={w} onClick={() => setWindow_(w)} style={{ padding: "6px 12px", borderRadius: 7, border: `1px solid ${window_ === w ? T.primary : T.textSub + "33"}`, background: window_ === w ? `${T.primary}18` : "transparent", color: window_ === w ? T.primary : T.textSub, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "10px 16px", background: `${T.success}11`, borderRadius: 10, border: `1px solid ${T.success}33` }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.success }} />
        <span style={{ fontSize: 13, color: T.success, fontWeight: 600 }}>Pixel ativo</span>
        <span style={{ fontSize: 13, color: T.textSub }}>·</span>
        <span style={{ fontSize: 13, color: T.textSub }}>ID: PX-284711-BR</span>
        <span style={{ fontSize: 13, color: T.textSub }}>·</span>
        <span style={{ fontSize: 13, color: T.textSub }}>Último fire: há 2 min</span>
        <span style={{ fontSize: 13, color: T.textSub }}>·</span>
        <span style={{ fontSize: 13, color: T.textSub }}>6 eventos rastreados</span>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Visitantes Impactados", value: "184k", sub: "por telas DOOH", color: T.primary, icon: <Users size={15} color={T.primary} /> },
          { label: "Conversões Atribuídas", value: "4.022", sub: `janela ${window_}`, color: T.success, icon: <MousePointer size={15} color={T.success} /> },
          { label: "Visit Lift Médio", value: "+158%", sub: "vs grupo controle", color: T.accent, icon: <TrendingUp size={15} color={T.accent} /> },
          { label: "Taxa de Conversão", value: "2.18%", sub: "expostos ao DOOH", color: T.warning, icon: <Fingerprint size={15} color={T.warning} /> },
        ].map(k => (
          <div key={k.label} style={{ background: T.panel, borderRadius: 12, padding: "16px 18px", border: `1px solid ${k.color}22` }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p style={{ fontSize: 11, color: T.textSub, margin: "0 0 6px" }}>{k.label}</p>
              {k.icon}
            </div>
            <p style={{ fontSize: 24, fontWeight: 800, margin: 0, color: k.color }}>{k.value}</p>
            <p style={{ fontSize: 11, color: T.textSub, margin: "4px 0 0" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 22, background: T.card, borderRadius: 10, padding: 4, width: "fit-content" }}>
        {(["overview", "funnel", "attribution", "setup"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
            background: tab === t ? T.panel : "transparent", color: tab === t ? T.text : T.textSub,
          }}>
            {{ overview: "Visão Geral", funnel: "Funil", attribution: "Atribuição", setup: "Instalação" }[t]}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Conversions timeline */}
          <div style={{ background: T.panel, borderRadius: 12, padding: 24, border: `1px solid ${T.textSub}18` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>Conversões e Visitas Diárias</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={TIMELINE} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.primary} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={T.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.success} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={T.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="dia" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.textSub}33`, borderRadius: 8, color: T.text, fontSize: 12 }} />
                <Area yAxisId="left" type="monotone" dataKey="visits" stroke={T.primary} fill="url(#gVisits)" strokeWidth={2} name="Visitas" />
                <Area yAxisId="right" type="monotone" dataKey="conversoes" stroke={T.success} fill="url(#gConv)" strokeWidth={2} name="Conversões" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Visit lift by city */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>Visit Lift por Cidade (%)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={LIFT_DATA} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <XAxis type="number" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="cidade" tick={{ fill: T.text, fontSize: 11 }} axisLine={false} tickLine={false} width={58} />
                  <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.textSub}33`, borderRadius: 8, color: T.text, fontSize: 12 }} formatter={(v: any, n: any) => [n === "lift" ? `+${v}%` : `${v}%`, n === "lift" ? "Lift" : n === "exposed" ? "Expostos" : "Controle"]} />
                  <Bar dataKey="exposed" fill={T.primary} name="exposed" radius={[0, 3, 3, 0]} opacity={0.6} />
                  <Bar dataKey="control" fill={T.textSub} name="control" radius={[0, 3, 3, 0]} opacity={0.4} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Events */}
            <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 14px" }}>Eventos Rastreados</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {EVENTS.map(e => (
                  <div key={e.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: T.card, borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: e.status === "active" ? T.success : e.status === "warning" ? T.warning : T.textSub }} />
                      <span style={{ fontSize: 13, fontFamily: "monospace", color: T.text }}>{e.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: e.status === "inactive" ? T.textSub : T.text }}>{e.fires}</span>
                      {e.status === "warning" && <AlertTriangle size={12} color={T.warning} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "funnel" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: T.panel, borderRadius: 12, padding: 24, border: `1px solid ${T.textSub}18` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 20px" }}>Funil de Atribuição DOOH</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {FUNNEL_DATA.map((step, i) => {
                const pct = Math.round((step.value / FUNNEL_DATA[0].value) * 100);
                return (
                  <div key={step.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{step.name}</span>
                      <div style={{ display: "flex", gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: step.fill }}>{step.value.toLocaleString("pt-BR")}</span>
                        <span style={{ fontSize: 12, color: T.textSub }}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: 28, background: `${T.textSub}18`, borderRadius: 6, overflow: "hidden", position: "relative" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: step.fill, borderRadius: 6, opacity: 0.8 }} />
                    </div>
                    {i < FUNNEL_DATA.length - 1 && (
                      <div style={{ fontSize: 11, color: T.textSub, textAlign: "right", marginTop: 3 }}>
                        ↓ {Math.round((FUNNEL_DATA[i + 1].value / step.value) * 100)}% avançam
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 14px" }}>Métricas de Funil</h3>
              {[
                { label: "Taxa Exposição → Visita", value: "12.2%", color: T.primary },
                { label: "Taxa Visita → Engajamento", value: "39.1%", color: T.accent },
                { label: "Taxa Engajamento → Conversão", value: "21.0%", color: T.success },
                { label: "Taxa Geral (Exposição → Conv.)", value: "1.00%", color: T.gold },
              ].map(m => (
                <div key={m.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.textSub}18` }}>
                  <span style={{ fontSize: 13, color: T.textSub }}>{m.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: m.color }}>{m.value}</span>
                </div>
              ))}
            </div>
            <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 12px" }}>ROAS por Tipo de Tela</h3>
              {[
                { tipo: "Billboard Premium", roas: "8.4×", color: T.success },
                { tipo: "Transit Media", roas: "6.2×", color: T.primary },
                { tipo: "Retail Indoor", roas: "11.1×", color: T.accent },
                { tipo: "Smart City", roas: "7.8×", color: T.warning },
              ].map(r => (
                <div key={r.tipo} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${T.textSub}18` }}>
                  <span style={{ fontSize: 12, color: T.textSub }}>{r.tipo}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: r.color }}>{r.roas}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "attribution" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: T.panel, borderRadius: 12, padding: 24, border: `1px solid ${T.textSub}18` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>Atribuição Multi-Canal</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={CHANNELS} cx="50%" cy="50%" outerRadius={88} paddingAngle={3} dataKey="conversoes">
                  {CHANNELS.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.textSub}33`, borderRadius: 8, color: T.text, fontSize: 12 }} formatter={(v: any) => [v.toLocaleString("pt-BR"), "Conversões"]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
              {CHANNELS.map(c => (
                <div key={c.channel} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 11, color: T.textSub, margin: 0 }}>{c.channel}</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: c.color, margin: 0 }}>{c.pct}% · {c.conversoes.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: T.panel, borderRadius: 12, padding: 24, border: `1px solid ${T.textSub}18` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px" }}>Janela de Atribuição</h3>
            <p style={{ fontSize: 12, color: T.textSub, margin: "0 0 16px" }}>Configure como crédito é dado ao DOOH</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { window: "Mesmo dia", conversoes: 820, model: "Last touch" },
                { window: "1 dia", conversoes: 1284, model: "Last touch" },
                { window: "7 dias", conversoes: 4022, model: "Last touch" },
                { window: "14 dias", conversoes: 5840, model: "Last touch" },
                { window: "30 dias", conversoes: 7120, model: "Last touch" },
              ].map(w => (
                <div key={w.window} style={{ display: "flex", alignItems: "center", justify: "space-between", padding: "10px 14px", background: window_ !== "30d" && w.window === `${window_}` ? `${T.primary}18` : T.card, borderRadius: 8, border: `1px solid ${T.textSub}22`, gap: 10 }}>
                  <Clock size={14} color={T.textSub} />
                  <span style={{ flex: 1, fontSize: 13 }}>{w.window}</span>
                  <span style={{ fontSize: 12, color: T.textSub }}>{w.model}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: T.primary }}>{w.conversoes.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "setup" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: T.panel, borderRadius: 12, padding: 24, border: `1px solid ${T.textSub}18` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px" }}>Código do Pixel</h3>
            <p style={{ fontSize: 12, color: T.textSub, margin: "0 0 14px" }}>Cole no <code style={{ color: T.accent }}>&lt;head&gt;</code> de todas as páginas</p>
            <div style={{ position: "relative" }}>
              <pre style={{ background: T.card, borderRadius: 10, padding: 16, fontSize: 11, color: "#a0c4ff", overflow: "auto", margin: 0, border: `1px solid ${T.textSub}33`, lineHeight: 1.6, fontFamily: "monospace" }}>
                {PIXEL_CODE}
              </pre>
              <button onClick={handleCopy} style={{ position: "absolute", top: 10, right: 10, background: copied ? `${T.success}22` : T.panel, border: `1px solid ${copied ? T.success : T.textSub + "44"}`, borderRadius: 7, padding: "6px 12px", color: copied ? T.success : T.textSub, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                {copied ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: T.panel, borderRadius: 12, padding: 20, border: `1px solid ${T.textSub}18` }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 14px" }}>Status de Implementação</h3>
              {[
                { step: "Pixel instalado", done: true },
                { step: "PageView ativo", done: true },
                { step: "Eventos de conversão mapeados", done: true },
                { step: "Teste de janela configurado", done: true },
                { step: "Grupo controle definido", done: true },
                { step: "Relatório de lift gerado", done: false },
              ].map(s => (
                <div key={s.step} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${T.textSub}18` }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: s.done ? `${T.success}22` : `${T.textSub}18`, border: `2px solid ${s.done ? T.success : T.textSub}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {s.done && <Check size={10} color={T.success} />}
                  </div>
                  <span style={{ fontSize: 13, color: s.done ? T.text : T.textSub }}>{s.step}</span>
                </div>
              ))}
            </div>
            <div style={{ background: `${T.primary}11`, borderRadius: 12, padding: 18, border: `1px solid ${T.primary}33` }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 8px", color: T.primary }}>Integrações Disponíveis</h3>
              {["Google Tag Manager", "Shopify / VTEX", "RD Station CRM", "HubSpot", "Salesforce"].map(i => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.textSub}18`, fontSize: 12 }}>
                  <span style={{ color: T.textSub }}>{i}</span>
                  <button style={{ background: "transparent", border: `1px solid ${T.primary}44`, borderRadius: 5, padding: "2px 8px", color: T.primary, cursor: "pointer", fontSize: 11 }}>Conectar</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
