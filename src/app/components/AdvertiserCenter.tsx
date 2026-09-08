import { useState } from "react";
import { ArrowLeft, Target, Eye, DollarSign, TrendingUp, Shield, CheckCircle2,
  Activity, Download, MapPin, Users, BarChart2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const T = {
  bg: "#020617", card: "#0F172A", cardLight: "#1E293B",
  border: "rgba(255,255,255,0.08)", primary: "#2563EB", secondary: "#0EA5E9",
  success: "#22C55E", warning: "#F59E0B", purple: "#8B5CF6", gray: "#64748B",
  text: "#F1F5F9", textSub: "#94A3B8",
};

const perfData = [
  { d: "Jan", impr: 6.2, reach: 1.8, conv: 0.42 }, { d: "Fev", impr: 7.1, reach: 2.1, conv: 0.48 },
  { d: "Mar", impr: 6.8, reach: 1.9, conv: 0.44 }, { d: "Abr", impr: 8.4, reach: 2.4, conv: 0.58 },
  { d: "Mai", impr: 9.2, reach: 2.7, conv: 0.64 }, { d: "Jun", impr: 10.1, reach: 3.0, conv: 0.71 },
  { d: "Jul", impr: 9.6, reach: 2.8, conv: 0.67 }, { d: "Ago", impr: 11.4, reach: 3.4, conv: 0.82 },
];

const campaigns = [
  { name: "Nike Q3 DOOH", city: "São Paulo", impr: "4.2M", cpm: "R$24", status: "Ativa", proof: true, budget: "R$120K", roi: "+41%" },
  { name: "Samsung Galaxy S25", city: "Rio de Janeiro", impr: "2.8M", cpm: "R$22", status: "Ativa", proof: true, budget: "R$84K", roi: "+38%" },
  { name: "iFood Promoção", city: "Brasil", impr: "8.4M", cpm: "R$18", status: "Ativa", proof: true, budget: "R$210K", roi: "+27%" },
  { name: "Vivo 5G", city: "Belo Horizonte", impr: "1.6M", cpm: "R$20", status: "Pausada", proof: true, budget: "R$48K", roi: "+19%" },
  { name: "Renner Liquidação", city: "Curitiba", impr: "2.1M", cpm: "R$17", status: "Ativa", proof: true, budget: "R$52K", roi: "+33%" },
];

const proofs = [
  { hash: "0x7f2a...c4e1", campaign: "Nike Q3", time: "há 2min", status: "verified" },
  { hash: "0x3b9c...f8d2", campaign: "Samsung", time: "há 4min", status: "verified" },
  { hash: "0xac4f...1e73", campaign: "iFood", time: "há 6min", status: "verified" },
  { hash: "0x2d8e...9b51", campaign: "Vivo 5G", time: "há 9min", status: "verified" },
];

const brazilCities = [
  { name: "SP", x: 52, y: 65, size: 24, impr: "28.4M" },
  { name: "RJ", x: 57, y: 68, size: 18, impr: "14.2M" },
  { name: "BH", x: 53, y: 60, size: 14, impr: "8.7M" },
  { name: "BSB", x: 50, y: 50, size: 12, impr: "5.8M" },
  { name: "CTB", x: 50, y: 72, size: 10, impr: "4.2M" },
  { name: "SSA", x: 60, y: 45, size: 9, impr: "3.1M" },
];

export default function AdvertiserCenter({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState("campanhas");
  const tabs = [
    { id: "campanhas", label: "Campanhas" },
    { id: "resultados", label: "Resultados" },
    { id: "mapa", label: "Mapa de Cobertura" },
    { id: "auditoria", label: "Auditoria" },
  ];

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <header className="sticky top-0 z-50 px-6 py-4 border-b flex items-center gap-4" style={{ background: `${T.bg}F0`, borderColor: T.border, backdropFilter: "blur(20px)" }}>
        <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/5" style={{ color: T.textSub }}><ArrowLeft size={16} /> Voltar</button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.primary }}><Target size={16} color="#fff" /></div>
          <div>
            <div className="font-bold text-lg leading-none" style={{ color: T.text }}>Advertiser Center</div>
            <div className="text-xs mt-0.5" style={{ color: T.textSub }}>Gerencie campanhas com Proof-of-Play auditável</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
            <Download size={14} /> Exportar Relatório
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: T.primary, color: "#fff" }}>
            <Target size={14} /> Nova Campanha
          </button>
        </div>
      </header>

      {/* KPIs */}
      <div className="px-6 py-4 border-b" style={{ borderColor: T.border }}>
        <div className="grid grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { l: "Impressões", v: "84.2M", c: T.primary, i: Eye },
            { l: "Reach", v: "2.4M", c: T.secondary, i: Users },
            { l: "CPM Médio", v: "R$18.40", c: T.success, i: DollarSign },
            { l: "Frequência", v: "4.2x", c: T.warning, i: Activity },
            { l: "ROI Médio", v: "+34%", c: T.success, i: TrendingUp },
            { l: "Conversões", v: "24.8K", c: T.purple, i: CheckCircle2 },
            { l: "Trust Score", v: "97.3", c: T.warning, i: Shield },
          ].map((k, i) => (
            <div key={`acKpi-${i}`} className="p-3 rounded-xl border" style={{ background: T.card, borderColor: `${k.c}20` }}>
              <div className="flex items-center gap-2 mb-1"><k.i size={12} style={{ color: k.c }} /><div className="text-xs" style={{ color: T.textSub }}>{k.l}</div></div>
              <div className="text-lg font-bold" style={{ color: k.c }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b flex gap-1 pt-4" style={{ borderColor: T.border }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className="px-4 py-2.5 text-sm font-semibold border-b-2 transition-all" style={{ color: activeTab === t.id ? T.primary : T.textSub, borderColor: activeTab === t.id ? T.primary : "transparent" }}>{t.label}</button>
        ))}
      </div>

      <div className="px-6 py-6">
        {activeTab === "campanhas" && (
          <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
            <div className="grid grid-cols-7 px-5 py-3 border-b text-xs font-semibold" style={{ borderColor: T.border, color: T.textSub }}>
              <span className="col-span-2">Campanha</span><span>Cidade</span><span>Impressões</span><span>CPM</span><span>Status</span><span>Proof</span>
            </div>
            {campaigns.map((c, i) => (
              <div key={`acamp-${i}`} className="grid grid-cols-7 px-5 py-3.5 border-b last:border-b-0 hover:bg-white/3 transition-colors items-center" style={{ borderColor: T.border }}>
                <div className="col-span-2">
                  <div className="text-sm font-semibold" style={{ color: T.text }}>{c.name}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>{c.budget} · ROI {c.roi}</div>
                </div>
                <span className="text-sm" style={{ color: T.textSub }}>{c.city}</span>
                <span className="text-sm font-semibold" style={{ color: T.primary }}>{c.impr}</span>
                <span className="text-sm" style={{ color: T.success }}>{c.cpm}</span>
                <span className="text-xs font-bold px-2 py-1 rounded-full w-fit" style={{ background: c.status === "Ativa" ? `${T.success}18` : `${T.warning}18`, color: c.status === "Ativa" ? T.success : T.warning }}>{c.status}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: T.success }}><CheckCircle2 size={12} /> Verified</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "resultados" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <div className="text-sm font-semibold mb-4" style={{ color: T.text }}>Impressões por Mês (M)</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={perfData}>
                  <defs><linearGradient key="acg" id="acg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.primary} stopOpacity={0.4} /><stop offset="100%" stopColor={T.primary} stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid key="accg" strokeDasharray="3 3" stroke={T.border} />
                  <XAxis key="acx" dataKey="d" tick={{ fontSize: 10, fill: T.textSub }} stroke={T.border} />
                  <YAxis key="acy" tick={{ fontSize: 10, fill: T.textSub }} stroke={T.border} />
                  <Tooltip key="actt" contentStyle={{ background: T.cardLight, border: "none", borderRadius: 8, fontSize: 11, color: T.text }} />
                  <Area key="aca" type="monotone" dataKey="impr" stroke={T.primary} strokeWidth={2} fill="url(#acg)" name="Impressões" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
              <div className="text-sm font-semibold mb-4" style={{ color: T.text }}>Conversões por Mês (K)</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={perfData}>
                  <CartesianGrid key="acbcg" strokeDasharray="3 3" stroke={T.border} />
                  <XAxis key="acbx" dataKey="d" tick={{ fontSize: 10, fill: T.textSub }} stroke={T.border} />
                  <YAxis key="acby" tick={{ fontSize: 10, fill: T.textSub }} stroke={T.border} />
                  <Tooltip key="acbtt" contentStyle={{ background: T.cardLight, border: "none", borderRadius: 8, fontSize: 11, color: T.text }} />
                  <Bar key="acbb" dataKey="conv" fill={T.success} radius={[4, 4, 0, 0]} name="Conversões" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "mapa" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border, minHeight: 400 }}>
              <div className="p-4 border-b text-sm font-semibold" style={{ borderColor: T.border, color: T.text }}>Cobertura por Cidade</div>
              <div className="relative h-80">
                <svg viewBox="0 0 100 100" className="w-full h-full" style={{ opacity: 0.2 }}>
                  <path d="M35,15 L45,12 L55,14 L65,18 L72,25 L75,35 L73,42 L70,48 L68,55 L65,62 L60,68 L57,72 L55,78 L52,83 L50,88 L48,82 L45,75 L42,70 L38,65 L35,60 L30,55 L27,48 L25,40 L26,32 L30,24 Z" fill="none" stroke={T.primary} strokeWidth="1" />
                </svg>
                {brazilCities.map((c, i) => (
                  <div key={`brc-${i}`} className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${c.x}%`, top: `${c.y}%` }}>
                    <div className="rounded-full flex items-center justify-center font-bold text-xs transition-all hover:scale-110" style={{ width: c.size, height: c.size, background: `${T.primary}40`, border: `2px solid ${T.primary}`, color: T.text, boxShadow: `0 0 ${c.size}px ${T.primary}40` }}>{c.name}</div>
                    <div className="text-xs mt-1 whitespace-nowrap font-semibold" style={{ color: T.secondary }}>{c.impr}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {brazilCities.map((c, i) => (
                <div key={`brl-${i}`} className="flex items-center justify-between p-3 rounded-xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="flex items-center gap-2"><MapPin size={12} style={{ color: T.primary }} /><span className="text-sm font-semibold" style={{ color: T.text }}>{c.name}</span></div>
                  <span className="text-sm font-bold" style={{ color: T.secondary }}>{c.impr}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "auditoria" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
              <div className="px-5 py-3 border-b text-sm font-bold flex items-center gap-2" style={{ borderColor: T.border, color: T.text }}><Shield size={14} style={{ color: T.success }} /> Últimas Provas Blockchain</div>
              {proofs.map((p, i) => (
                <div key={`proof-${i}`} className="flex items-center gap-3 px-5 py-3 border-b last:border-b-0" style={{ borderColor: T.border }}>
                  <CheckCircle2 size={16} style={{ color: T.success }} />
                  <div className="flex-1"><div className="text-sm font-mono" style={{ color: T.primary }}>{p.hash}</div><div className="text-xs" style={{ color: T.textSub }}>{p.campaign} · {p.time}</div></div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${T.success}18`, color: T.success }}>Verificado</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              {[{ l: "Provas Registradas", v: "4.8M", c: T.success, i: CheckCircle2 }, { l: "Blockchain Sync", v: "Ethereum #18.2M", c: T.primary, i: BarChart2 }, { l: "ICP Brasil", v: "A3 Ativo", c: T.warning, i: Shield }, { l: "LGPD", v: "Compliance", c: T.secondary, i: Shield }].map((s, i) => (
                <div key={`aud-${i}`} className="flex items-center gap-4 p-4 rounded-2xl border" style={{ background: T.card, borderColor: `${s.c}25` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.c}18` }}><s.i size={20} style={{ color: s.c }} /></div>
                  <div><div className="text-xs" style={{ color: T.textSub }}>{s.l}</div><div className="text-lg font-bold" style={{ color: s.c }}>{s.v}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
